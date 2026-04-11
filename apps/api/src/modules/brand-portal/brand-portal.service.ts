import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  BrandAccount,
  BrandQuestion,
  BrandCertificate,
  BrandProductEdit,
  Brand,
  Product,
  ProductIngredient,
} from '@database/entities';
import { RegisterBrandDto, LoginBrandDto, CreateQuestionDto, AnswerQuestionDto, UpdateProductInfoDto } from './dto';
import { BrandJwtPayload } from './strategies/brand-jwt.strategy';

@Injectable()
export class BrandPortalService {
  constructor(
    @InjectRepository(BrandAccount)
    private readonly accountRepo: Repository<BrandAccount>,
    @InjectRepository(BrandQuestion)
    private readonly questionRepo: Repository<BrandQuestion>,
    @InjectRepository(BrandCertificate)
    private readonly certificateRepo: Repository<BrandCertificate>,
    @InjectRepository(BrandProductEdit)
    private readonly editRepo: Repository<BrandProductEdit>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly jwtService: JwtService,
  ) {}

  // ─── AUTH ──────────────────────────────────────────────────

  async register(dto: RegisterBrandDto) {
    const existingEmail = await this.accountRepo.findOne({ where: { email: dto.email } });
    if (existingEmail) {
      throw new ConflictException('Bu e-posta adresi zaten kayıtlı');
    }

    const existingBrand = await this.accountRepo.findOne({ where: { brand_id: dto.brand_id } });
    if (existingBrand) {
      throw new ConflictException('Bu marka zaten claim edilmiş');
    }

    const brand = await this.brandRepo.findOne({ where: { brand_id: dto.brand_id } });
    if (!brand) {
      throw new NotFoundException('Marka bulunamadı');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const account = this.accountRepo.create({
      brand_id: dto.brand_id,
      email: dto.email,
      password_hash: passwordHash,
      representative_name: dto.representative_name,
      representative_title: dto.representative_title,
      phone: dto.phone,
      verification_status: 'pending',
      plan: 'starter',
      billing_cycle: 'monthly',
    });

    const saved = await this.accountRepo.save(account);

    const token = this.signToken(saved);

    return {
      access_token: token,
      account: {
        account_id: saved.account_id,
        brand_id: saved.brand_id,
        brand_name: brand.brand_name,
        email: saved.email,
        plan: saved.plan,
        verification_status: saved.verification_status,
      },
    };
  }

  async login(dto: LoginBrandDto) {
    const account = await this.accountRepo.findOne({
      where: { email: dto.email },
      relations: ['brand'],
    });

    if (!account || !account.is_active) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    const valid = await bcrypt.compare(dto.password, account.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    await this.accountRepo.update(account.account_id, {
      last_login_at: new Date(),
      login_count: () => 'login_count + 1',
    } as any);

    const token = this.signToken(account);

    return {
      access_token: token,
      account: {
        account_id: account.account_id,
        brand_id: account.brand_id,
        brand_name: account.brand?.brand_name,
        email: account.email,
        plan: account.plan,
        verification_status: account.verification_status,
        representative_name: account.representative_name,
      },
    };
  }

  private signToken(account: BrandAccount): string {
    const payload: BrandJwtPayload = {
      sub: account.account_id,
      brand_id: account.brand_id,
      email: account.email,
      plan: account.plan,
      type: 'brand',
    };
    return this.jwtService.sign(payload);
  }

  // ─── DASHBOARD ─────────────────────────────────────────────

  async getDashboard(accountId: number, brandId: number) {
    const [productCount, questionCount, unansweredCount, certCount] = await Promise.all([
      this.productRepo.count({ where: { brand_id: brandId } }),
      this.questionRepo.count({ where: { brand_id: brandId } }),
      this.questionRepo.count({ where: { brand_id: brandId, status: 'pending' } }),
      this.certificateRepo.count({ where: { brand_id: brandId } }),
    ]);

    const transparencyScore = await this.calculateTransparencyScore(brandId);

    const recentQuestions = await this.questionRepo.find({
      where: { brand_id: brandId },
      order: { created_at: 'DESC' },
      take: 5,
    });

    return {
      stats: {
        product_count: productCount,
        total_questions: questionCount,
        unanswered_questions: unansweredCount,
        certificate_count: certCount,
      },
      transparency: transparencyScore,
      recent_questions: recentQuestions,
    };
  }

  // ─── PRODUCTS ──────────────────────────────────────────────

  async getBrandProducts(brandId: number, page = 1, limit = 20) {
    const [products, total] = await this.productRepo.findAndCount({
      where: { brand_id: brandId },
      order: { product_name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['images'],
    });

    return { products, total, page, limit };
  }

  async updateProductInfo(
    accountId: number,
    brandId: number,
    productId: number,
    dto: UpdateProductInfoDto,
  ) {
    const product = await this.productRepo.findOne({
      where: { product_id: productId, brand_id: brandId },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı veya bu markaya ait değil');
    }

    // Create audit trail for each changed field
    const edits: BrandProductEdit[] = [];
    for (const [key, newValue] of Object.entries(dto)) {
      if (newValue === undefined) continue;

      const edit = this.editRepo.create({
        brand_account_id: accountId,
        product_id: productId,
        field_name: key,
        old_value: (product as any)[key]?.toString() || null,
        new_value: newValue.toString(),
        status: 'pending',
      });
      edits.push(edit);
    }

    if (edits.length > 0) {
      await this.editRepo.save(edits);
    }

    return {
      message: `${edits.length} alan güncelleme isteği oluşturuldu`,
      pending_edits: edits.length,
    };
  }

  // ─── Q&A — PUBLIC (kullanıcı sorusu) ──────────────────────

  async createQuestion(dto: CreateQuestionDto) {
    const brand = await this.brandRepo.findOne({ where: { brand_id: dto.brand_id } });
    if (!brand) {
      throw new NotFoundException('Marka bulunamadı');
    }

    if (dto.product_id) {
      const product = await this.productRepo.findOne({
        where: { product_id: dto.product_id, brand_id: dto.brand_id },
      });
      if (!product) {
        throw new BadRequestException('Ürün bu markaya ait değil');
      }
    }

    // Spam check: max 3 questions per anonymous_id per brand per day
    if (dto.anonymous_id) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const count = await this.questionRepo
        .createQueryBuilder('q')
        .where('q.brand_id = :brandId', { brandId: dto.brand_id })
        .andWhere('q.anonymous_id = :anonId', { anonId: dto.anonymous_id })
        .andWhere('q.created_at >= :today', { today })
        .getCount();

      if (count >= 3) {
        throw new BadRequestException('Günlük soru limiti aşıldı (max 3 soru/marka/gün)');
      }
    }

    const question = this.questionRepo.create({
      brand_id: dto.brand_id,
      product_id: dto.product_id || undefined,
      anonymous_id: dto.anonymous_id,
      category: dto.category,
      question: dto.question,
      status: 'pending',
    });

    return this.questionRepo.save(question);
  }

  async getPublicQuestions(brandId: number, productId?: number, page = 1, limit = 10) {
    const qb = this.questionRepo.createQueryBuilder('q')
      .where('q.brand_id = :brandId', { brandId })
      .andWhere('q.is_visible = true')
      .andWhere('q.status IN (:...statuses)', { statuses: ['pending', 'answered'] });

    if (productId) {
      qb.andWhere('q.product_id = :productId', { productId });
    }

    qb.orderBy('q.is_featured', 'DESC')
      .addOrderBy('q.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [questions, total] = await qb.getManyAndCount();

    return { questions, total, page, limit };
  }

  // ─── Q&A — BRAND (marka cevabı) ───────────────────────────

  async getBrandQuestions(brandId: number, status?: string, page = 1, limit = 20) {
    const where: any = { brand_id: brandId };
    if (status) {
      where.status = status;
    }

    const [questions, total] = await this.questionRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { questions, total, page, limit };
  }

  async answerQuestion(accountId: number, brandId: number, questionId: number, dto: AnswerQuestionDto) {
    const question = await this.questionRepo.findOne({
      where: { question_id: questionId, brand_id: brandId },
    });

    if (!question) {
      throw new NotFoundException('Soru bulunamadı');
    }

    if (question.status === 'answered') {
      throw new BadRequestException('Bu soru zaten cevaplanmış');
    }

    question.answer = dto.answer;
    question.answered_by = accountId;
    question.answered_at = new Date();
    question.status = 'answered';

    return this.questionRepo.save(question);
  }

  // ─── CERTIFICATES ─────────────────────────────────────────

  async getBrandCertificates(brandId: number) {
    return this.certificateRepo.find({
      where: { brand_id: brandId },
      order: { created_at: 'DESC' },
    });
  }

  async addCertificate(brandId: number, data: Partial<BrandCertificate>) {
    const cert = this.certificateRepo.create({
      ...data,
      brand_id: brandId,
      verification_status: 'pending',
    });
    return this.certificateRepo.save(cert);
  }

  // ─── TRANSPARENCY SCORE ───────────────────────────────────

  async calculateTransparencyScore(brandId: number) {
    const products = await this.productRepo.find({ where: { brand_id: brandId } });
    const certCount = await this.certificateRepo.count({
      where: { brand_id: brandId, verification_status: 'verified' },
    });
    const totalQuestions = await this.questionRepo.count({ where: { brand_id: brandId } });
    const answeredQuestions = await this.questionRepo.count({
      where: { brand_id: brandId, status: 'answered' },
    });

    const productCount = products.length;
    if (productCount === 0) {
      return { overall: 0, grade: 'F', breakdown: this.emptyBreakdown() };
    }

    // A. Product completeness (0-25)
    let completenessSum = 0;
    for (const p of products) {
      let score = 0;
      if (p.product_name && p.short_description) score += 3;
      else if (p.product_name) score += 1;
      if ((p as any).usage_instructions) score += 2;
      if ((p as any).target_skin_types || (p as any).target_gender) score += 1;
      if (p.images && p.images.length > 0) score += 1;
      completenessSum += score;
    }
    const maxCompleteness = productCount * 7;
    const productCompleteness = Math.min(25, Math.round((completenessSum / maxCompleteness) * 25));

    // B. Ingredient transparency (0-25) — based on edits approved
    const approvedEdits = await this.editRepo.count({
      where: { brand_account_id: Not(IsNull()), status: 'approved' },
    });
    const ingredientTransparency = Math.min(25, Math.round((approvedEdits / Math.max(1, productCount * 3)) * 25));

    // C. Certification trust (0-20)
    let certScore = 0;
    const certs = await this.certificateRepo.find({
      where: { brand_id: brandId, verification_status: 'verified' },
    });
    for (const c of certs) {
      if (c.certificate_type === 'gmp') certScore += 5;
      else if (c.certificate_type === 'iso_22716') certScore += 3;
      else if (c.certificate_type === 'dermatologist_test') certScore += 4;
      else if (c.certificate_type === 'vegan') certScore += 2;
      else if (c.certificate_type === 'cruelty_free') certScore += 2;
      else if (c.certificate_type === 'clinical_study') certScore += 5;
      else certScore += 1;
    }
    const certificationTrust = Math.min(20, certScore);

    // D. Community engagement (0-15)
    let communityScore = 0;
    if (totalQuestions > 0) {
      const answerRate = answeredQuestions / totalQuestions;
      if (answerRate >= 1.0) communityScore = 8;
      else if (answerRate >= 0.8) communityScore = 6;
      else if (answerRate >= 0.6) communityScore = 4;
      else if (answerRate >= 0.4) communityScore = 2;

      // Response time bonus (simplified — would need answered_at - created_at avg)
      if (answeredQuestions > 0) communityScore += 4; // Simplified: +4 if any answers
    }
    const communityEngagement = Math.min(15, communityScore);

    // E. Scientific evidence (0-15)
    let scienceScore = 0;
    const clinicalStudy = certs.find((c) => c.certificate_type === 'clinical_study');
    if (clinicalStudy) scienceScore += 5;
    const stabilityTest = certs.find((c) => c.certificate_type === 'stability_test');
    if (stabilityTest) scienceScore += 3;
    const labTest = certs.find((c) => c.certificate_type === 'lab_test');
    if (labTest) scienceScore += 4;
    const scientificEvidence = Math.min(15, scienceScore);

    const overall = productCompleteness + ingredientTransparency + certificationTrust + communityEngagement + scientificEvidence;

    const grade = overall >= 95 ? 'S'
      : overall >= 80 ? 'A'
      : overall >= 65 ? 'B'
      : overall >= 45 ? 'C'
      : overall >= 25 ? 'D'
      : 'F';

    return {
      overall,
      grade,
      breakdown: {
        product_completeness: productCompleteness,
        ingredient_transparency: ingredientTransparency,
        certification_trust: certificationTrust,
        community_engagement: communityEngagement,
        scientific_evidence: scientificEvidence,
      },
    };
  }

  private emptyBreakdown() {
    return {
      product_completeness: 0,
      ingredient_transparency: 0,
      certification_trust: 0,
      community_engagement: 0,
      scientific_evidence: 0,
    };
  }

  // ─── ADMIN ─────────────────────────────────────────────────

  async getPendingApplications() {
    return this.accountRepo.find({
      where: { verification_status: 'pending' },
      relations: ['brand'],
      order: { created_at: 'ASC' },
    });
  }

  async verifyBrand(accountId: number, adminUserId: number, method: string) {
    const account = await this.accountRepo.findOne({ where: { account_id: accountId } });
    if (!account) throw new NotFoundException('Hesap bulunamadı');

    account.verification_status = 'manually_verified';
    account.verification_method = method;
    account.verified_at = new Date();
    account.verified_by = adminUserId;

    return this.accountRepo.save(account);
  }

  async rejectBrand(accountId: number, adminUserId: number) {
    const account = await this.accountRepo.findOne({ where: { account_id: accountId } });
    if (!account) throw new NotFoundException('Hesap bulunamadı');

    account.verification_status = 'rejected';
    account.verified_by = adminUserId;
    account.verified_at = new Date();

    return this.accountRepo.save(account);
  }

  async getPendingEdits(page = 1, limit = 20) {
    const [edits, total] = await this.editRepo.findAndCount({
      where: { status: 'pending' },
      order: { created_at: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { edits, total, page, limit };
  }

  async reviewEdit(editId: number, adminUserId: number, approved: boolean) {
    const edit = await this.editRepo.findOne({ where: { edit_id: editId } });
    if (!edit) throw new NotFoundException('Düzenleme bulunamadı');

    edit.status = approved ? 'approved' : 'rejected';
    edit.reviewed_by = adminUserId;
    edit.reviewed_at = new Date();

    const saved = await this.editRepo.save(edit);

    // If approved, apply the change to the product
    if (approved) {
      await this.productRepo
        .createQueryBuilder()
        .update()
        .set({ [edit.field_name]: edit.new_value })
        .where('product_id = :id', { id: edit.product_id })
        .execute();
    }

    return saved;
  }
}
