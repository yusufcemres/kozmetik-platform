-- =====================================================
-- REVELA — Marka Logo URL'leri Seed
-- Kaynak: Google Favicon API (https://www.google.com/s2/favicons?domain={domain}&sz=128)
-- Tarih: 2026-04-12
-- Not: Clearbit Logo API kapatildi, Google Favicon API kullanildi
-- =====================================================

-- === Global / Buyuk Markalar ===
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=laroche-posay.com&sz=128', website_url = COALESCE(website_url, 'https://www.laroche-posay.com') WHERE brand_slug = 'la-roche-posay';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=cerave.com&sz=128', website_url = COALESCE(website_url, 'https://www.cerave.com') WHERE brand_slug = 'cerave';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=theordinary.com&sz=128', website_url = COALESCE(website_url, 'https://www.theordinary.com') WHERE brand_slug = 'the-ordinary';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=bioderma.com&sz=128', website_url = COALESCE(website_url, 'https://www.bioderma.com') WHERE brand_slug = 'bioderma';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=eau-thermale-avene.com&sz=128', website_url = COALESCE(website_url, 'https://www.eau-thermale-avene.com') WHERE brand_slug = 'avene';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=svr.fr&sz=128', website_url = COALESCE(website_url, 'https://www.svr.fr') WHERE brand_slug = 'svr';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=eucerin.com&sz=128', website_url = COALESCE(website_url, 'https://www.eucerin.com') WHERE brand_slug = 'eucerin';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=neutrogena.com&sz=128', website_url = COALESCE(website_url, 'https://www.neutrogena.com') WHERE brand_slug = 'neutrogena';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=vichy.com&sz=128', website_url = COALESCE(website_url, 'https://www.vichy.com') WHERE brand_slug = 'vichy';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=nuxe.com&sz=128', website_url = COALESCE(website_url, 'https://www.nuxe.com') WHERE brand_slug = 'nuxe';

-- === K-Beauty ===
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=cosrx.com&sz=128' WHERE brand_slug = 'cosrx';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=uriage.com&sz=128' WHERE brand_slug = 'uriage';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=ducray.com&sz=128' WHERE brand_slug = 'ducray';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=hadalabo.jp&sz=128' WHERE brand_slug = 'hada-labo';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=klairs.com&sz=128' WHERE brand_slug = 'klairs';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=purito.com&sz=128' WHERE brand_slug = 'purito';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=somebymi.com&sz=128' WHERE brand_slug = 'some-by-mi';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=cetaphil.com&sz=128' WHERE brand_slug = 'cetaphil';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=paulaschoice.com&sz=128' WHERE brand_slug = 'paulas-choice';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=drunkelephant.com&sz=128' WHERE brand_slug = 'drunk-elephant';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=isntree.com&sz=128' WHERE brand_slug = 'isntree';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=beautyofjoseon.com&sz=128' WHERE brand_slug = 'beauty-of-joseon';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=misshaus.com&sz=128' WHERE brand_slug = 'missha';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=garnier.com&sz=128' WHERE brand_slug = 'garnier';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=nivea.com&sz=128' WHERE brand_slug = 'nivea';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=innisfree.com&sz=128' WHERE brand_slug = 'innisfree';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=laneige.com&sz=128' WHERE brand_slug = 'laneige';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=drjart.com&sz=128' WHERE brand_slug = 'dr-jart';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=etude.com&sz=128' WHERE brand_slug = 'etude-house';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=torriden.com&sz=128' WHERE brand_slug = 'torriden';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=roundlab.com&sz=128' WHERE brand_slug = 'round-lab';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=axis-y.com&sz=128' WHERE brand_slug = 'axis-y';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=skin1004.com&sz=128' WHERE brand_slug = 'skin1004';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=anuaofficial.com&sz=128' WHERE brand_slug = 'anua';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=medicube.com&sz=128' WHERE brand_slug = 'medicube';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=numbuzin.com&sz=128' WHERE brand_slug = 'numbuzin';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=heimish.co.kr&sz=128' WHERE brand_slug = 'heimish';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=bywishtrend.com&sz=128' WHERE brand_slug = 'by-wishtrend';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=bentoncosmetic.com&sz=128' WHERE brand_slug = 'benton';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=neogenlab.us&sz=128' WHERE brand_slug = 'neogen';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=holikaholika.co.kr&sz=128' WHERE brand_slug = 'holika-holika';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=senka.com&sz=128' WHERE brand_slug = 'senka';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=rohto.co.jp&sz=128' WHERE brand_slug = 'melano-cc';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=canmake.com&sz=128' WHERE brand_slug = 'canmake';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=biore.com&sz=128' WHERE brand_slug = 'biore';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=muji.com&sz=128' WHERE brand_slug = 'muji';

-- === Premium / Luxury ===
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=kiehls.com&sz=128' WHERE brand_slug = 'kiehls';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=clinique.com&sz=128' WHERE brand_slug = 'clinique';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=esteelauder.com&sz=128' WHERE brand_slug = 'estee-lauder';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=shiseido.com&sz=128' WHERE brand_slug = 'shiseido';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=sk-ii.com&sz=128' WHERE brand_slug = 'sk-ii';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=dermalogica.com&sz=128' WHERE brand_slug = 'dermalogica';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=murad.com&sz=128' WHERE brand_slug = 'murad';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=sundayriley.com&sz=128' WHERE brand_slug = 'sunday-riley';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=tatcha.com&sz=128' WHERE brand_slug = 'tatcha';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=fresh.com&sz=128' WHERE brand_slug = 'fresh';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=glowrecipe.com&sz=128' WHERE brand_slug = 'glow-recipe';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=farmacybeauty.com&sz=128' WHERE brand_slug = 'farmacy';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=aveeno.com&sz=128' WHERE brand_slug = 'aveeno';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=simple.co.uk&sz=128' WHERE brand_slug = 'simple';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=sebamed.com&sz=128' WHERE brand_slug = 'sebamed';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=dove.com&sz=128' WHERE brand_slug = 'dove';

-- === Dogal / Organik / Eczane ===
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=weleda.com&sz=128' WHERE brand_slug = 'weleda';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=dr.hauschka.com&sz=128' WHERE brand_slug = 'dr-hauschka';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=caudalie.com&sz=128' WHERE brand_slug = 'caudalie';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=embryolisse.com&sz=128' WHERE brand_slug = 'embryolisse';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=filorga.com&sz=128' WHERE brand_slug = 'filorga';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=lierac.com&sz=128' WHERE brand_slug = 'lierac';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=noreva.com&sz=128' WHERE brand_slug = 'noreva';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=labo-acm.com&sz=128' WHERE brand_slug = 'acm';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=altruistsun.com&sz=128' WHERE brand_slug = 'altruist';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=geekandgorgeous.com&sz=128' WHERE brand_slug = 'geek-gorgeous';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=peterthomasroth.com&sz=128' WHERE brand_slug = 'peter-thomas-roth';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=rilastil.com&sz=128' WHERE brand_slug = 'rilastil';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=isispharma.com&sz=128' WHERE brand_slug = 'isis-pharma';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=heliocare.com&sz=128' WHERE brand_slug = 'heliocare';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=skinceuticals.com&sz=128' WHERE brand_slug = 'skinceuticals';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=thebodyshop.com&sz=128' WHERE brand_slug = 'the-body-shop';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=burtsbees.com&sz=128' WHERE brand_slug = 'burts-bees';

-- === Turk Markalari ===
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=procsin.com.tr&sz=128' WHERE brand_slug = 'procsin';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=dermoskin.com.tr&sz=128' WHERE brand_slug = 'dermoskin';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=doa.com.tr&sz=128' WHERE brand_slug = 'doa';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=thalia.com.tr&sz=128' WHERE brand_slug = 'thalia';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=incia.com.tr&sz=128' WHERE brand_slug = 'incia';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=rosense.com.tr&sz=128' WHERE brand_slug = 'rosense';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=siveno.com.tr&sz=128' WHERE brand_slug = 'siveno';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=bebak.com.tr&sz=128' WHERE brand_slug = 'bebak';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=hunca.com.tr&sz=128' WHERE brand_slug = 'hunca';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=farmasi.com.tr&sz=128' WHERE brand_slug = 'farmasi';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=marjinal.com.tr&sz=128' WHERE brand_slug = 'marjinal';

-- === Diger K-Beauty ===
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=mizon.co.kr&sz=128' WHERE brand_slug = 'mizon';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=tonymoly.com&sz=128' WHERE brand_slug = 'tonymoly';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=pyunkangyul.us&sz=128' WHERE brand_slug = 'pyunkang-yul';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=illiyoon.com&sz=128' WHERE brand_slug = 'illiyoon';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=sulwhasoo.com&sz=128' WHERE brand_slug = 'sulwhasoo';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=banilaco.com&sz=128' WHERE brand_slug = 'banila-co';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=peripera.com&sz=128' WHERE brand_slug = 'peripera';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=iunikcos.com&sz=128' WHERE brand_slug = 'iunik';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=centellian24.com&sz=128' WHERE brand_slug = 'centellian24';

-- === Makyaj Markalari ===
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=olay.com&sz=128' WHERE brand_slug = 'olay';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=loreal-paris.com&sz=128' WHERE brand_slug = 'loreal-paris';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=nyxcosmetics.com&sz=128' WHERE brand_slug = 'nyx';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=maybelline.com&sz=128' WHERE brand_slug = 'maybelline';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=revolutionbeauty.com&sz=128' WHERE brand_slug = 'revolution';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=catrice.eu&sz=128' WHERE brand_slug = 'catrice';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=essence.eu&sz=128' WHERE brand_slug = 'essence';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=maccosmetics.com&sz=128' WHERE brand_slug = 'mac';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=charlottetilbury.com&sz=128' WHERE brand_slug = 'charlotte-tilbury';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=rarebeauty.com&sz=128' WHERE brand_slug = 'rare-beauty';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=fentybeauty.com&sz=128' WHERE brand_slug = 'fenty-beauty';

-- === Takviye Markalari ===
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=solgar.com&sz=128' WHERE brand_slug = 'solgar';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=dynavit.com.tr&sz=128' WHERE brand_slug = 'dynavit';

-- === Duplicate slug'lar ===
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=cerave.com&sz=128' WHERE brand_slug = 'cerave-tr';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=vichy.com&sz=128' WHERE brand_slug = 'dercos';
UPDATE brands SET logo_url = 'https://www.google.com/s2/favicons?domain=nuxe.com&sz=128' WHERE brand_slug = 'nuxe-tr';
