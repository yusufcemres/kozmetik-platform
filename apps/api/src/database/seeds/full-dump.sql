--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_roles (
    role_id integer NOT NULL,
    role_key character varying(50) NOT NULL,
    role_name character varying(100) NOT NULL,
    description text,
    permissions jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: admin_roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_roles_role_id_seq OWNED BY public.admin_roles.role_id;


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    admin_user_id integer NOT NULL,
    email character varying(200) NOT NULL,
    password_hash character varying(250) NOT NULL,
    full_name character varying(100) NOT NULL,
    role_id integer NOT NULL,
    is_active boolean DEFAULT true,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: admin_users_admin_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_users_admin_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_users_admin_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_users_admin_user_id_seq OWNED BY public.admin_users.admin_user_id;


--
-- Name: affiliate_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.affiliate_links (
    affiliate_link_id integer NOT NULL,
    product_id integer NOT NULL,
    platform character varying(50) NOT NULL,
    affiliate_url character varying(1000) NOT NULL,
    price_snapshot numeric(10,2),
    price_updated_at timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: affiliate_links_affiliate_link_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.affiliate_links_affiliate_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: affiliate_links_affiliate_link_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.affiliate_links_affiliate_link_id_seq OWNED BY public.affiliate_links.affiliate_link_id;


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    api_key_id integer NOT NULL,
    company_name character varying(100) NOT NULL,
    contact_email character varying(255) NOT NULL,
    key_hash character varying(64) NOT NULL,
    key_prefix character varying(12) NOT NULL,
    allowed_endpoints text,
    rate_limit_per_hour integer DEFAULT 1000,
    rate_limit_per_day integer DEFAULT 10000,
    total_requests bigint DEFAULT 0,
    last_request_at timestamp without time zone,
    expires_at timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: api_keys_api_key_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_keys_api_key_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_keys_api_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_keys_api_key_id_seq OWNED BY public.api_keys.api_key_id;


--
-- Name: approved_wordings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approved_wordings (
    wording_id integer NOT NULL,
    category character varying(50) NOT NULL,
    approved_text text NOT NULL,
    forbidden_alternative text,
    usage_note text,
    language character varying(20) DEFAULT 'tr'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: approved_wordings_wording_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.approved_wordings_wording_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: approved_wordings_wording_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.approved_wordings_wording_id_seq OWNED BY public.approved_wordings.wording_id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    log_id integer NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id integer NOT NULL,
    action character varying(50) NOT NULL,
    changes jsonb,
    admin_user_id integer,
    admin_email character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: audit_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_log_id_seq OWNED BY public.audit_logs.log_id;


--
-- Name: batch_imports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.batch_imports (
    import_id integer NOT NULL,
    import_type character varying(100) NOT NULL,
    file_name character varying(500),
    total_rows integer DEFAULT 0,
    success_count integer DEFAULT 0,
    error_count integer DEFAULT 0,
    error_details jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    admin_user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: batch_imports_import_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.batch_imports_import_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: batch_imports_import_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.batch_imports_import_id_seq OWNED BY public.batch_imports.import_id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    brand_id integer NOT NULL,
    brand_name character varying(150) NOT NULL,
    brand_slug character varying(150) NOT NULL,
    country_of_origin character varying(100),
    website_url character varying(500),
    logo_url character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: brands_brand_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_brand_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_brand_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_brand_id_seq OWNED BY public.brands.brand_id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    parent_category_id integer,
    category_name character varying(150) NOT NULL,
    category_slug character varying(150) NOT NULL,
    domain_type character varying(20) DEFAULT 'cosmetic'::character varying,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- Name: content_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_articles (
    article_id integer NOT NULL,
    title character varying(300) NOT NULL,
    slug character varying(300) NOT NULL,
    content_type character varying(50) NOT NULL,
    summary text,
    body_markdown text,
    status character varying(20) DEFAULT 'draft'::character varying,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: content_articles_article_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_articles_article_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_articles_article_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_articles_article_id_seq OWNED BY public.content_articles.article_id;


--
-- Name: evidence_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evidence_levels (
    evidence_level_id integer NOT NULL,
    level_key character varying(50) NOT NULL,
    level_name character varying(100) NOT NULL,
    description text,
    rank_order integer NOT NULL,
    badge_color character varying(20),
    badge_emoji character varying(10),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: evidence_levels_evidence_level_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.evidence_levels_evidence_level_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: evidence_levels_evidence_level_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.evidence_levels_evidence_level_id_seq OWNED BY public.evidence_levels.evidence_level_id;


--
-- Name: formula_revisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.formula_revisions (
    revision_id integer NOT NULL,
    product_id integer NOT NULL,
    previous_inci_text text NOT NULL,
    new_inci_text text NOT NULL,
    change_summary text,
    changed_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: formula_revisions_revision_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.formula_revisions_revision_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: formula_revisions_revision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.formula_revisions_revision_id_seq OWNED BY public.formula_revisions.revision_id;


--
-- Name: ingredient_aliases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredient_aliases (
    alias_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    alias_name character varying(250) NOT NULL,
    language character varying(20) DEFAULT 'tr'::character varying,
    alias_type character varying(50) DEFAULT 'common'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ingredient_aliases_alias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredient_aliases_alias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredient_aliases_alias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredient_aliases_alias_id_seq OWNED BY public.ingredient_aliases.alias_id;


--
-- Name: ingredient_evidence_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredient_evidence_links (
    link_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    source_url character varying(500) NOT NULL,
    source_title character varying(250) NOT NULL,
    source_type character varying(100),
    publication_year integer,
    summary_note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ingredient_evidence_links_link_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredient_evidence_links_link_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredient_evidence_links_link_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredient_evidence_links_link_id_seq OWNED BY public.ingredient_evidence_links.link_id;


--
-- Name: ingredient_interactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredient_interactions (
    interaction_id integer NOT NULL,
    ingredient_a_id integer NOT NULL,
    ingredient_b_id integer NOT NULL,
    severity character varying(30) NOT NULL,
    domain_type character varying(30) DEFAULT 'both'::character varying,
    interaction_context character varying(30) DEFAULT 'ingredient'::character varying,
    description text NOT NULL,
    recommendation text,
    source_url character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ingredient_interactions_interaction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredient_interactions_interaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredient_interactions_interaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredient_interactions_interaction_id_seq OWNED BY public.ingredient_interactions.interaction_id;


--
-- Name: ingredient_need_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredient_need_mappings (
    ingredient_need_mapping_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    need_id integer NOT NULL,
    relevance_score integer NOT NULL,
    effect_type character varying(50) NOT NULL,
    evidence_level character varying(50),
    usage_context_note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ingredient_need_mappings_relevance_score_check CHECK (((relevance_score >= 0) AND (relevance_score <= 100)))
);


--
-- Name: ingredient_need_mappings_ingredient_need_mapping_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredient_need_mappings_ingredient_need_mapping_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredient_need_mappings_ingredient_need_mapping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredient_need_mappings_ingredient_need_mapping_id_seq OWNED BY public.ingredient_need_mappings.ingredient_need_mapping_id;


--
-- Name: ingredient_related_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredient_related_articles (
    ingredient_related_article_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    article_id integer NOT NULL
);


--
-- Name: ingredient_related_articles_ingredient_related_article_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredient_related_articles_ingredient_related_article_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredient_related_articles_ingredient_related_article_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredient_related_articles_ingredient_related_article_id_seq OWNED BY public.ingredient_related_articles.ingredient_related_article_id;


--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredients (
    ingredient_id integer NOT NULL,
    domain_type character varying(20) DEFAULT 'cosmetic'::character varying,
    inci_name character varying(250) NOT NULL,
    common_name character varying(250),
    ingredient_slug character varying(250) NOT NULL,
    ingredient_group character varying(100),
    origin_type character varying(50),
    function_summary text,
    detailed_description text,
    sensitivity_note text,
    allergen_flag boolean DEFAULT false,
    fragrance_flag boolean DEFAULT false,
    preservative_flag boolean DEFAULT false,
    evidence_level character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ingredients_ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredients_ingredient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredients_ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredients_ingredient_id_seq OWNED BY public.ingredients.ingredient_id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: need_related_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.need_related_articles (
    need_related_article_id integer NOT NULL,
    need_id integer NOT NULL,
    article_id integer NOT NULL
);


--
-- Name: need_related_articles_need_related_article_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.need_related_articles_need_related_article_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: need_related_articles_need_related_article_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.need_related_articles_need_related_article_id_seq OWNED BY public.need_related_articles.need_related_article_id;


--
-- Name: needs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.needs (
    need_id integer NOT NULL,
    domain_type character varying(20) DEFAULT 'cosmetic'::character varying,
    need_name character varying(150) NOT NULL,
    need_slug character varying(150) NOT NULL,
    need_group character varying(100),
    short_description text,
    detailed_description text,
    user_friendly_label character varying(200),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: needs_need_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.needs_need_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: needs_need_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.needs_need_id_seq OWNED BY public.needs.need_id;


--
-- Name: price_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_history (
    price_history_id integer NOT NULL,
    affiliate_link_id integer NOT NULL,
    price numeric(10,2) NOT NULL,
    in_stock boolean DEFAULT true,
    currency character varying(10) DEFAULT 'TRY'::character varying,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: price_history_price_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.price_history_price_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: price_history_price_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.price_history_price_history_id_seq OWNED BY public.price_history.price_history_id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    image_id integer NOT NULL,
    product_id integer NOT NULL,
    image_url character varying(500) NOT NULL,
    image_type character varying(50) DEFAULT 'product'::character varying,
    sort_order integer DEFAULT 0,
    alt_text character varying(200),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_images_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_images_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_images_image_id_seq OWNED BY public.product_images.image_id;


--
-- Name: product_ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_ingredients (
    product_ingredient_id integer NOT NULL,
    product_id integer NOT NULL,
    ingredient_id integer,
    ingredient_display_name character varying(250) NOT NULL,
    inci_order_rank integer NOT NULL,
    listed_as_raw character varying(250),
    concentration_band character varying(20) DEFAULT 'unknown'::character varying,
    is_below_one_percent_estimate boolean DEFAULT false,
    is_highlighted_in_claims boolean DEFAULT false,
    match_status character varying(20) DEFAULT 'auto'::character varying,
    match_confidence numeric(4,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_ingredients_product_ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_ingredients_product_ingredient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_ingredients_product_ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_ingredients_product_ingredient_id_seq OWNED BY public.product_ingredients.product_ingredient_id;


--
-- Name: product_labels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_labels (
    product_label_id integer NOT NULL,
    product_id integer NOT NULL,
    inci_raw_text text,
    ingredient_header_text character varying(500),
    usage_instructions text,
    warning_text text,
    manufacturer_info text,
    distributor_info text,
    origin_info character varying(200),
    batch_reference character varying(100),
    expiry_info character varying(100),
    pao_info character varying(50),
    net_content_display character varying(100),
    packaging_symbols_json jsonb,
    claim_texts_json jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_labels_product_label_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_labels_product_label_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_labels_product_label_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_labels_product_label_id_seq OWNED BY public.product_labels.product_label_id;


--
-- Name: product_masters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_masters (
    master_id integer NOT NULL,
    brand_id integer NOT NULL,
    category_id integer NOT NULL,
    master_name character varying(250) NOT NULL,
    domain_type character varying(20) DEFAULT 'cosmetic'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_masters_master_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_masters_master_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_masters_master_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_masters_master_id_seq OWNED BY public.product_masters.master_id;


--
-- Name: product_need_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_need_scores (
    product_need_score_id integer NOT NULL,
    product_id integer NOT NULL,
    need_id integer NOT NULL,
    compatibility_score numeric(5,2) NOT NULL,
    score_reason_summary text,
    explanation_logic jsonb,
    confidence_level character varying(20) DEFAULT 'medium'::character varying,
    calculated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_need_scores_product_need_score_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_need_scores_product_need_score_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_need_scores_product_need_score_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_need_scores_product_need_score_id_seq OWNED BY public.product_need_scores.product_need_score_id;


--
-- Name: product_related_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_related_articles (
    product_related_article_id integer NOT NULL,
    product_id integer NOT NULL,
    article_id integer NOT NULL
);


--
-- Name: product_related_articles_product_related_article_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_related_articles_product_related_article_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_related_articles_product_related_article_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_related_articles_product_related_article_id_seq OWNED BY public.product_related_articles.product_related_article_id;


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    variant_id integer NOT NULL,
    master_id integer NOT NULL,
    region character varying(100),
    size_label character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_variants_variant_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_variants_variant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_variants_variant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_variants_variant_id_seq OWNED BY public.product_variants.variant_id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    product_id integer NOT NULL,
    variant_id integer,
    brand_id integer NOT NULL,
    category_id integer NOT NULL,
    domain_type character varying(20) DEFAULT 'cosmetic'::character varying,
    product_name character varying(300) NOT NULL,
    product_slug character varying(300) NOT NULL,
    product_type_label character varying(100),
    short_description text,
    barcode character varying(50),
    net_content_value numeric(10,2),
    net_content_unit character varying(20),
    target_area character varying(100),
    usage_time_hint character varying(50),
    status character varying(20) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;


--
-- Name: scoring_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scoring_configs (
    config_id integer NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value numeric(5,3) NOT NULL,
    description character varying(200),
    config_group character varying(50) DEFAULT 'scoring'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: scoring_configs_config_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scoring_configs_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scoring_configs_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.scoring_configs_config_id_seq OWNED BY public.scoring_configs.config_id;


--
-- Name: sponsorship_disclosures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsorship_disclosures (
    disclosure_id integer NOT NULL,
    article_id integer NOT NULL,
    sponsor_name character varying(200) NOT NULL,
    disclosure_level character varying(20) NOT NULL,
    disclosure_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: sponsorship_disclosures_disclosure_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sponsorship_disclosures_disclosure_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sponsorship_disclosures_disclosure_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sponsorship_disclosures_disclosure_id_seq OWNED BY public.sponsorship_disclosures.disclosure_id;


--
-- Name: supplement_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplement_details (
    supplement_detail_id integer NOT NULL,
    product_id integer NOT NULL,
    form character varying(30) NOT NULL,
    serving_size numeric(10,2),
    serving_unit character varying(20),
    servings_per_container integer,
    recommended_use character varying(200),
    warnings text,
    requires_prescription boolean DEFAULT false,
    manufacturer_country character varying(100),
    certification character varying(200),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: supplement_details_supplement_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supplement_details_supplement_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supplement_details_supplement_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supplement_details_supplement_detail_id_seq OWNED BY public.supplement_details.supplement_detail_id;


--
-- Name: supplement_ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplement_ingredients (
    supplement_ingredient_id integer NOT NULL,
    product_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    amount_per_serving numeric(10,3),
    unit character varying(20),
    daily_value_percentage numeric(5,1),
    is_proprietary_blend boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: supplement_ingredients_supplement_ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supplement_ingredients_supplement_ingredient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supplement_ingredients_supplement_ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supplement_ingredients_supplement_ingredient_id_seq OWNED BY public.supplement_ingredients.supplement_ingredient_id;


--
-- Name: user_corrections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_corrections (
    correction_id integer NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id integer NOT NULL,
    correction_text text NOT NULL,
    reporter_email character varying(200),
    status character varying(20) DEFAULT 'pending'::character varying,
    admin_note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_corrections_correction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_corrections_correction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_corrections_correction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_corrections_correction_id_seq OWNED BY public.user_corrections.correction_id;


--
-- Name: user_skin_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_skin_profiles (
    profile_id integer NOT NULL,
    anonymous_id character varying(100) NOT NULL,
    skin_type character varying(20),
    concerns jsonb DEFAULT '[]'::jsonb,
    sensitivities jsonb DEFAULT '{}'::jsonb,
    age_range character varying(10),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_skin_profiles_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_skin_profiles_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_skin_profiles_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_skin_profiles_profile_id_seq OWNED BY public.user_skin_profiles.profile_id;


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhooks (
    webhook_id integer NOT NULL,
    api_key_id integer NOT NULL,
    url character varying(500) NOT NULL,
    events text NOT NULL,
    secret_hash character varying(64),
    is_active boolean DEFAULT true,
    failed_count integer DEFAULT 0,
    last_triggered_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: webhooks_webhook_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.webhooks_webhook_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: webhooks_webhook_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.webhooks_webhook_id_seq OWNED BY public.webhooks.webhook_id;


--
-- Name: admin_roles role_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_roles ALTER COLUMN role_id SET DEFAULT nextval('public.admin_roles_role_id_seq'::regclass);


--
-- Name: admin_users admin_user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN admin_user_id SET DEFAULT nextval('public.admin_users_admin_user_id_seq'::regclass);


--
-- Name: affiliate_links affiliate_link_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_links ALTER COLUMN affiliate_link_id SET DEFAULT nextval('public.affiliate_links_affiliate_link_id_seq'::regclass);


--
-- Name: api_keys api_key_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN api_key_id SET DEFAULT nextval('public.api_keys_api_key_id_seq'::regclass);


--
-- Name: approved_wordings wording_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approved_wordings ALTER COLUMN wording_id SET DEFAULT nextval('public.approved_wordings_wording_id_seq'::regclass);


--
-- Name: audit_logs log_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN log_id SET DEFAULT nextval('public.audit_logs_log_id_seq'::regclass);


--
-- Name: batch_imports import_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batch_imports ALTER COLUMN import_id SET DEFAULT nextval('public.batch_imports_import_id_seq'::regclass);


--
-- Name: brands brand_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands ALTER COLUMN brand_id SET DEFAULT nextval('public.brands_brand_id_seq'::regclass);


--
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- Name: content_articles article_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_articles ALTER COLUMN article_id SET DEFAULT nextval('public.content_articles_article_id_seq'::regclass);


--
-- Name: evidence_levels evidence_level_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evidence_levels ALTER COLUMN evidence_level_id SET DEFAULT nextval('public.evidence_levels_evidence_level_id_seq'::regclass);


--
-- Name: formula_revisions revision_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formula_revisions ALTER COLUMN revision_id SET DEFAULT nextval('public.formula_revisions_revision_id_seq'::regclass);


--
-- Name: ingredient_aliases alias_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_aliases ALTER COLUMN alias_id SET DEFAULT nextval('public.ingredient_aliases_alias_id_seq'::regclass);


--
-- Name: ingredient_evidence_links link_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_evidence_links ALTER COLUMN link_id SET DEFAULT nextval('public.ingredient_evidence_links_link_id_seq'::regclass);


--
-- Name: ingredient_interactions interaction_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_interactions ALTER COLUMN interaction_id SET DEFAULT nextval('public.ingredient_interactions_interaction_id_seq'::regclass);


--
-- Name: ingredient_need_mappings ingredient_need_mapping_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_need_mappings ALTER COLUMN ingredient_need_mapping_id SET DEFAULT nextval('public.ingredient_need_mappings_ingredient_need_mapping_id_seq'::regclass);


--
-- Name: ingredient_related_articles ingredient_related_article_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_related_articles ALTER COLUMN ingredient_related_article_id SET DEFAULT nextval('public.ingredient_related_articles_ingredient_related_article_id_seq'::regclass);


--
-- Name: ingredients ingredient_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN ingredient_id SET DEFAULT nextval('public.ingredients_ingredient_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: need_related_articles need_related_article_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need_related_articles ALTER COLUMN need_related_article_id SET DEFAULT nextval('public.need_related_articles_need_related_article_id_seq'::regclass);


--
-- Name: needs need_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.needs ALTER COLUMN need_id SET DEFAULT nextval('public.needs_need_id_seq'::regclass);


--
-- Name: price_history price_history_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_history ALTER COLUMN price_history_id SET DEFAULT nextval('public.price_history_price_history_id_seq'::regclass);


--
-- Name: product_images image_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images ALTER COLUMN image_id SET DEFAULT nextval('public.product_images_image_id_seq'::regclass);


--
-- Name: product_ingredients product_ingredient_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_ingredients ALTER COLUMN product_ingredient_id SET DEFAULT nextval('public.product_ingredients_product_ingredient_id_seq'::regclass);


--
-- Name: product_labels product_label_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_labels ALTER COLUMN product_label_id SET DEFAULT nextval('public.product_labels_product_label_id_seq'::regclass);


--
-- Name: product_masters master_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_masters ALTER COLUMN master_id SET DEFAULT nextval('public.product_masters_master_id_seq'::regclass);


--
-- Name: product_need_scores product_need_score_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_need_scores ALTER COLUMN product_need_score_id SET DEFAULT nextval('public.product_need_scores_product_need_score_id_seq'::regclass);


--
-- Name: product_related_articles product_related_article_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_related_articles ALTER COLUMN product_related_article_id SET DEFAULT nextval('public.product_related_articles_product_related_article_id_seq'::regclass);


--
-- Name: product_variants variant_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants ALTER COLUMN variant_id SET DEFAULT nextval('public.product_variants_variant_id_seq'::regclass);


--
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- Name: scoring_configs config_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scoring_configs ALTER COLUMN config_id SET DEFAULT nextval('public.scoring_configs_config_id_seq'::regclass);


--
-- Name: sponsorship_disclosures disclosure_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsorship_disclosures ALTER COLUMN disclosure_id SET DEFAULT nextval('public.sponsorship_disclosures_disclosure_id_seq'::regclass);


--
-- Name: supplement_details supplement_detail_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_details ALTER COLUMN supplement_detail_id SET DEFAULT nextval('public.supplement_details_supplement_detail_id_seq'::regclass);


--
-- Name: supplement_ingredients supplement_ingredient_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_ingredients ALTER COLUMN supplement_ingredient_id SET DEFAULT nextval('public.supplement_ingredients_supplement_ingredient_id_seq'::regclass);


--
-- Name: user_corrections correction_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_corrections ALTER COLUMN correction_id SET DEFAULT nextval('public.user_corrections_correction_id_seq'::regclass);


--
-- Name: user_skin_profiles profile_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_skin_profiles ALTER COLUMN profile_id SET DEFAULT nextval('public.user_skin_profiles_profile_id_seq'::regclass);


--
-- Name: webhooks webhook_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks ALTER COLUMN webhook_id SET DEFAULT nextval('public.webhooks_webhook_id_seq'::regclass);


--
-- Data for Name: admin_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_roles (role_id, role_key, role_name, description, permissions, created_at) FROM stdin;
1	super_admin	Süper Admin	Tüm yetkiler	["*"]	2026-04-02 23:56:47.445243
2	content_editor	İçerik Editörü	Makale ve ürün metinleri	["articles.write", "products.write", "approved_wordings.write"]	2026-04-02 23:56:47.445243
3	taxonomy_editor	Taksonomi Editörü	İçerik, ihtiyaç, kategori, marka CRUD	["ingredients.write", "needs.write", "categories.write", "brands.write"]	2026-04-02 23:56:47.445243
4	reviewer	İnceleyici	Review ve publish onayı	["*.review", "*.publish"]	2026-04-02 23:56:47.445243
5	methodology_reviewer	Metodoloji İnceleyici	Kanıt seviyesi ve ifade onayı	["evidence_levels.write", "approved_wordings.write"]	2026-04-02 23:56:47.445243
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (admin_user_id, email, password_hash, full_name, role_id, is_active, last_login_at, created_at, updated_at) FROM stdin;
1	admin@kozmetik.com	$2b$12$GJrX2rkUlMzwzhlNKtuL.u/XoEcXX3yNgiqDO7gOApIYyYVBz0rMa	Sistem Admin	1	t	2026-04-03 03:58:40.672	2026-04-02 23:56:51.885138	2026-04-03 00:58:40.684935
\.


--
-- Data for Name: affiliate_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.affiliate_links (affiliate_link_id, product_id, platform, affiliate_url, price_snapshot, price_updated_at, is_active, created_at, updated_at) FROM stdin;
1	1	trendyol	https://www.trendyol.com/cerave/moisturising-cream-p-123456	389.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
2	1	hepsiburada	https://www.hepsiburada.com/cerave-moisturising-cream-pm-HB00123	399.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
3	1	dermoeczanem	https://www.dermoeczanem.com/cerave-moisturising-cream	379.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
4	2	trendyol	https://www.trendyol.com/cerave/foaming-cleanser-p-234567	299.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
5	2	gratis	https://www.gratis.com/cerave-foaming-cleanser	309.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
6	3	trendyol	https://www.trendyol.com/cerave/pm-lotion-p-345678	449.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
7	3	hepsiburada	https://www.hepsiburada.com/cerave-pm-lotion-pm-HB00345	459.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
8	4	trendyol	https://www.trendyol.com/la-roche-posay/effaclar-duo-p-456789	549.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
9	4	dermoeczanem	https://www.dermoeczanem.com/lrp-effaclar-duo	539.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
10	4	hepsiburada	https://www.hepsiburada.com/lrp-effaclar-duo-pm-HB00456	559.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
11	5	trendyol	https://www.trendyol.com/la-roche-posay/anthelios-uvmune-p-567890	619.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
12	5	gratis	https://www.gratis.com/lrp-anthelios-uvmune-400	629.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
13	6	trendyol	https://www.trendyol.com/la-roche-posay/cicaplast-baume-b5-p-678901	429.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
14	6	dermoeczanem	https://www.dermoeczanem.com/lrp-cicaplast-baume	419.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
15	7	trendyol	https://www.trendyol.com/bioderma/sensibio-h2o-p-789012	349.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
16	7	hepsiburada	https://www.hepsiburada.com/bioderma-sensibio-h2o-pm-HB00789	359.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
17	7	gratis	https://www.gratis.com/bioderma-sensibio-h2o	339.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
18	11	trendyol	https://www.trendyol.com/the-ordinary/niacinamide-10-zinc-1-p-111213	189.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
19	11	hepsiburada	https://www.hepsiburada.com/to-niacinamide-zinc-pm-HB01112	199.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
20	12	trendyol	https://www.trendyol.com/the-ordinary/hyaluronic-acid-2-b5-p-121314	179.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
21	13	trendyol	https://www.trendyol.com/the-ordinary/retinol-05-squalane-p-131415	219.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
22	13	hepsiburada	https://www.hepsiburada.com/to-retinol-05-pm-HB01314	229.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
23	14	trendyol	https://www.trendyol.com/the-ordinary/aha-30-bha-2-peeling-p-141516	209.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
24	20	trendyol	https://www.trendyol.com/neutrogena/hydro-boost-water-gel-p-202122	329.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
25	20	gratis	https://www.gratis.com/neutrogena-hydro-boost	339.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
26	24	trendyol	https://www.trendyol.com/eucerin/urearepair-plus-p-242526	469.90	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
27	24	dermoeczanem	https://www.dermoeczanem.com/eucerin-urearepair-plus	459.00	\N	t	2026-04-03 01:03:19.899962	2026-04-03 01:03:19.899962
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_keys (api_key_id, company_name, contact_email, key_hash, key_prefix, allowed_endpoints, rate_limit_per_hour, rate_limit_per_day, total_requests, last_request_at, expires_at, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: approved_wordings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.approved_wordings (wording_id, category, approved_text, forbidden_alternative, usage_note, language, is_active, created_at, updated_at) FROM stdin;
1	nemlendirme	Cildi nemlendirmeye yardımcı olur	Cildi sonsuza kadar nemlendirir	Kesin ifadelerden kaçının	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
2	nemlendirme	Nem dengesini korumaya destek olur	Kuruluğu tamamen ortadan kaldırır	\N	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
3	anti-aging	Kırışıklık görünümünü azaltmaya yardımcı olur	Kırışıklıkları yok eder	Kozmetik ürünler tedavi etmez	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
4	anti-aging	Yaşlanma belirtilerinin görünümünü iyileştirmeye destek olur	10 yaş gençleştirir	\N	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
5	sivilce	Sivilce eğilimli ciltler için formüle edilmiştir	Sivilceleri tedavi eder	Tedavi ifadesi tıbbi üründür	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
6	sivilce	Gözeneklerin tıkanmasını azaltmaya yardımcı olur	Sivilceleri kesin çözüm	\N	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
7	leke	Cilt tonunun eşitlenmesine yardımcı olur	Lekeleri siler	Silmek ifadesi yanıltıcı	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
8	leke	Koyu leke görünümünü azaltmaya destek olur	Lekeleri tedavi eder	\N	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
9	bariyer	Cilt bariyerini güçlendirmeye yardımcı olur	Cilt bariyerini onarır	Onarım ifadesi tıbbi	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
10	hassasiyet	Hassas ciltler için uygunluğu test edilmiştir	Alerji yapmaz	%100 garanti verilemez	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
11	genel	İçerdiği [aktif] sayesinde [fayda] sağlamaya yardımcı olur	[Aktif] sayesinde kesinlikle [fayda] sağlar	Kesinlik belirten ifadelerden kaçının	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
12	genel	Dermatolojik olarak test edilmiştir	Doktor onaylıdır	Onay ile test farklı kavramlar	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
13	güneş	SPF koruma faktörlü	Güneşten %100 korur	%100 koruma mümkün değil	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
14	parfüm	Parfüm içermez	Hipoalerjenik	Hipoalerjenik düzenlenmiş bir terim değil	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
15	doğal	Doğal kaynaklı içerikler ile formüle edilmiştir	%100 doğal	%100 doğal formülasyon neredeyse imkansız	tr	t	2026-04-02 23:56:52.028749	2026-04-02 23:56:52.028749
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (log_id, entity_type, entity_id, action, changes, admin_user_id, admin_email, created_at) FROM stdin;
\.


--
-- Data for Name: batch_imports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.batch_imports (import_id, import_type, file_name, total_rows, success_count, error_count, error_details, status, admin_user_id, created_at) FROM stdin;
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brands (brand_id, brand_name, brand_slug, country_of_origin, website_url, logo_url, is_active, created_at, updated_at) FROM stdin;
1	La Roche-Posay	la-roche-posay	Fransa	\N	\N	t	2026-04-02 23:56:51.922088	2026-04-02 23:56:51.922088
2	CeraVe	cerave	ABD	\N	\N	t	2026-04-02 23:56:51.922088	2026-04-02 23:56:51.922088
3	The Ordinary	the-ordinary	Kanada	\N	\N	t	2026-04-02 23:56:51.922088	2026-04-02 23:56:51.922088
4	Bioderma	bioderma	Fransa	\N	\N	t	2026-04-02 23:56:51.922088	2026-04-02 23:56:51.922088
5	Avene	avene	Fransa	\N	\N	t	2026-04-02 23:56:51.922088	2026-04-02 23:56:51.922088
6	SVR	svr	Fransa	\N	\N	t	2026-04-02 23:56:51.922088	2026-04-02 23:56:51.922088
7	Eucerin	eucerin	Almanya	\N	\N	t	2026-04-02 23:56:51.922088	2026-04-02 23:56:51.922088
8	Neutrogena	neutrogena	ABD	\N	\N	t	2026-04-02 23:56:51.922088	2026-04-02 23:56:51.922088
9	Vichy	vichy	Fransa	\N	\N	t	2026-04-02 23:56:51.922088	2026-04-02 23:56:51.922088
10	Nuxe	nuxe	Fransa	\N	\N	t	2026-04-02 23:56:51.922088	2026-04-02 23:56:51.922088
11	Test Marka Güncellendi	test-marka-guncellendi	Türkiye	\N	\N	f	2026-04-03 00:21:52.749276	2026-04-03 00:22:23.899489
12	API Test	api-test	\N	\N	\N	f	2026-04-03 00:33:23.558349	2026-04-03 00:33:30.792802
13	COSRX	cosrx	Güney Kore	\N	\N	t	2026-04-03 00:52:14.342941	2026-04-03 00:52:14.342941
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (category_id, parent_category_id, category_name, category_slug, domain_type, sort_order, is_active, created_at, updated_at) FROM stdin;
1	\N	Yüz Bakım	yuz-bakim	cosmetic	1	t	2026-04-02 23:56:51.909273	2026-04-02 23:56:51.909273
2	\N	Temizleme	temizleme	cosmetic	2	t	2026-04-02 23:56:51.909273	2026-04-02 23:56:51.909273
3	\N	Güneş Koruma	gunes-koruma	cosmetic	3	t	2026-04-02 23:56:51.909273	2026-04-02 23:56:51.909273
4	\N	Göz Bakım	goz-bakim	cosmetic	4	t	2026-04-02 23:56:51.909273	2026-04-02 23:56:51.909273
5	\N	Dudak Bakım	dudak-bakim	cosmetic	5	t	2026-04-02 23:56:51.909273	2026-04-02 23:56:51.909273
6	\N	Vücut Bakım	vucut-bakim	cosmetic	6	t	2026-04-02 23:56:51.909273	2026-04-02 23:56:51.909273
7	\N	Saç Bakım	sac-bakim	cosmetic	7	t	2026-04-02 23:56:51.909273	2026-04-02 23:56:51.909273
8	\N	Makyaj	makyaj	cosmetic	8	t	2026-04-02 23:56:51.909273	2026-04-02 23:56:51.909273
9	\N	Vitamin & Mineral	vitamin-mineral	supplement	10	t	2026-04-02 23:56:52.078155	2026-04-02 23:56:52.078155
10	\N	Probiyotik	probiyotik	supplement	11	t	2026-04-02 23:56:52.078155	2026-04-02 23:56:52.078155
11	\N	Bitkisel Takviye	bitkisel-takviye	supplement	12	t	2026-04-02 23:56:52.078155	2026-04-02 23:56:52.078155
12	\N	Omega & Yağ Asitleri	omega-yag-asitleri	supplement	13	t	2026-04-02 23:56:52.078155	2026-04-02 23:56:52.078155
13	\N	Test Kategori	test-kategori	cosmetic	99	f	2026-04-03 00:21:52.86751	2026-04-03 00:22:02.133779
\.


--
-- Data for Name: content_articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_articles (article_id, title, slug, content_type, summary, body_markdown, status, published_at, created_at, updated_at) FROM stdin;
1	Niacinamide Nedir? Cilt İçin Faydaları ve Kullanımı	niacinamide-nedir-faydalari	ingredient_guide	B3 vitamini olarak da bilinen niacinamide, cilt bakımında en çok araştırılan aktif maddelerden biridir.	## Niacinamide Nedir?\n\nNiacinamide (niasinamid), B3 vitamininin aktif formudur. Suda çözünür bir vitamindir ve topikal olarak uygulandığında cildin üst tabakalarına nüfuz edebilir.\n\n## Kanıtlanmış Faydaları\n\n### 1. Gözenek Görünümünü Azaltır\n%5 konsantrasyonda niacinamide kullanımının 12 hafta sonunda gözenek görünümünü anlamlı ölçüde azalttığı gösterilmiştir.\n\n### 2. Leke ve Hiperpigmentasyonu Hafifletir\nMelanin üretimini düzenleyerek koyu lekelerin açılmasına yardımcı olur. Etkisi 8-12 hafta düzenli kullanımda belirginleşir.\n\n### 3. Yağ Üretimini Dengeler\nSebum üretimini düzenleyerek yağlı cilt parlamasını kontrol eder.\n\n### 4. Cilt Bariyerini Güçlendirir\nCeramide üretimini destekleyerek cildin doğal koruma bariyerini onarır.\n\n## Nasıl Kullanılır?\n\n- **Konsantrasyon:** %2-10 arası etkili, %5 en yaygın\n- **Uygulama:** Temizleme sonrası, nemlendirici öncesi\n- **Sıklık:** Günde 2 kez (sabah ve akşam)\n- **Kombinasyon:** Hyaluronic acid, ceramide ile uyumlu\n\n## Dikkat Edilmesi Gerekenler\n\n- Yüksek konsantrasyonlarda (%10+) hassas ciltlerde kızarıklık yapabilir\n- C vitamini ile aynı anda kullanılabilir\n- Sonuçlar 4-8 hafta düzenli kullanımda görülür	published	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751
2	Sivilce Eğilimli Cilt İçin En İyi 5 Aktif Madde	sivilce-icin-en-iyi-5-aktif	guide	Sivilce tedavisinde bilimsel olarak etkisi kanıtlanmış 5 aktif madde: salisilik asit, niacinamide, çinko, azelaik asit ve retinol.	## Sivilce ile Mücadelede Bilim Ne Diyor?\n\nSivilce (akne vulgaris), dünyada en yaygın cilt sorunlarından biridir.\n\n## 1. Salisilik Asit (BHA)\n\n**Ne yapar:** Yağda çözünür yapısı sayesinde gözeneklerin içine nüfuz ederek tıkanıklığı giderir.\n**Konsantrasyon:** %0.5-2\n**Kanıt düzeyi:** Yüksek\n\n## 2. Niacinamide\n\n**Ne yapar:** Sebum üretimini düzenler, iltihap karşıtı etki gösterir.\n**Konsantrasyon:** %4-5\n**Kanıt düzeyi:** Yüksek\n\n## 3. Çinko (Zinc PCA)\n\n**Ne yapar:** Antimikrobiyal ve anti-inflamatuar etki gösterir.\n**Konsantrasyon:** %1-4 (topikal)\n\n## 4. Azelaik Asit\n\n**Ne yapar:** Antibakteriyel, keratolotik ve anti-inflamatuar.\n**Konsantrasyon:** %10-20\n\n## 5. Retinol\n\n**Ne yapar:** Hücre yenilenmesini hızlandırır, gözeneklerin tıkanmasını önler.\n**Konsantrasyon:** %0.1-0.5\n\n## Kullanım Sırası Önerisi\n\n1. Temizleyici (salisilik asitli)\n2. Tonik/esans\n3. Niacinamide + Zinc serum\n4. Nemlendirici\n5. Güneş kremi (sabah)	published	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751
3	Cilt Bariyeri Nedir? Nasıl Onarılır?	cilt-bariyeri-nedir-nasil-onarilir	guide	Cilt bariyeri sağlığı, tüm cilt bakım rutinlerinin temelidir. Bariyer hasarının belirtileri, nedenleri ve onarım yöntemleri.	## Cilt Bariyeri Nedir?\n\nCildin en dış tabakası olan stratum corneum, vücudun dış dünyaya karşı ilk savunma hattıdır. Bu tabaka, ceramidler, kolesterol ve yağ asitlerinden oluşan bir "tuğla-harç" yapısına sahiptir.\n\n## Bariyer Hasarının Belirtileri\n\n- Sıkılık ve kuruluk hissi\n- Kızarıklık ve hassasiyet\n- Ürünler batıyor veya yakıyor\n- Ciltte pullanma\n- Normalden fazla yağlanma (kompansatuar)\n\n## Neler Bariyeri Bozar?\n\n- Aşırı temizleme (günde 3+ yıkama)\n- Sert yüzey aktif maddeler (SLS)\n- Aktif madde aşırı kullanımı\n- Çok sıcak suyla yıkama\n\n## Onarım İçin Anahtar Maddeler\n\n### Ceramide\nBariyerin yapı taşı. CeraVe, Eucerin gibi markalar ceramide içerikli ürünleriyle bilinir.\n\n### Hyaluronic Acid\nSu tutma kapasitesi yüksek, nem kaybını azaltır.\n\n### Panthenol (B5)\nYatıştırıcı, onarıcı, nem tutma kapasitesini artırır.\n\n### Urea (%5-10)\nHem nemlendirici hem hafif keratolotik etki gösterir.\n\n## Bariyer Onarım Rutini\n\n1. Nazik temizleyici (sülfatsız)\n2. Hyaluronic acid serum (nemli cilde)\n3. Ceramide + panthenol içeren nemlendirici\n4. Güneş kremi (sabah)\n\n**Süre:** Bariyer onarımı genellikle 2-4 hafta sürer.	published	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751
4	AHA ve BHA Farkı Nedir? Hangisini Seçmelisin?	aha-bha-farki-hangisini-secmelisin	guide	Kimyasal eksfoliyanlar AHA ve BHA arasındaki farklar, cilt tipine göre seçim rehberi.	## Kimyasal Eksfoliyasyon Nedir?\n\nKimyasal eksfoliyantlar, ölü hücreleri fiziksel sürtünme yerine kimyasal reaksiyonla uzaklaştırır.\n\n## AHA (Alfa Hidroksi Asitler)\n\n**Örnekler:** Glikolik asit, laktik asit, mandelic asit\n**Nasıl çalışır:** Suda çözünür. Cildin yüzeyindeki hücre bağlarını kopararak ölü hücreleri uzaklaştırır.\n\n**Kime uygun:**\n- Kuru ve normal ciltler\n- Güneş hasarı ve lekeler\n- İnce çizgiler\n\n## BHA (Beta Hidroksi Asitler)\n\n**Örnek:** Salisilik asit\n**Nasıl çalışır:** Yağda çözünür. Gözeneklerin içine nüfuz ederek tıkanıklığı giderir.\n\n**Kime uygun:**\n- Yağlı ve karma ciltler\n- Sivilce eğilimli ciltler\n- Siyah nokta sorunu\n\n## Karşılaştırma\n\n| Özellik | AHA | BHA |\n|---------|-----|-----|\n| Çözünürlük | Suda | Yağda |\n| Derinlik | Yüzey | Gözenek içi |\n| En uygun cilt | Kuru/normal | Yağlı/karma |\n| Anti-aging | Güçlü | Zayıf |\n| Anti-akne | Zayıf | Güçlü |\n\n## İkisi Birlikte Kullanılır mı?\n\nEvet, ancak dikkatli olunmalı. Haftada 1-2 kez kombinasyon ürün kullanılabilir.	published	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751
5	Retinol Rehberi: Başlangıçtan İleri Seviyeye	retinol-rehberi-baslangictan-ileri-seviyeye	ingredient_guide	Retinol kullanımına yeni başlayanlar ve deneyimli kullanıcılar için kapsamlı rehber.	## Retinol Nedir?\n\nRetinol, A vitamininin topikal formudur. Anti-aging alanında altın standart olarak kabul edilir.\n\n## Faydaları\n\n- Kırışıklık ve ince çizgileri azaltır\n- Kolajen üretimini artırır\n- Hücre yenilenmesini hızlandırır\n- Gözenek görünümünü azaltır\n- Hiperpigmentasyonu hafifletir\n\n## Başlangıç Rehberi\n\n### Hafta 1-2: Alıştırma\n- %0.1-0.2 retinol ile başla\n- Haftada 2 gece uygula\n\n### Hafta 3-4: Artırma\n- Haftada 3-4 geceye çık\n- Tahriş yoksa devam\n\n### Ay 2+: Düzenli Kullanım\n- Her akşam veya gün aşırı\n- Konsantrasyon artırılabilir (%0.3-0.5)\n\n## Retinol Yanığı (Retinization)\n\nİlk 2-6 hafta normal:\n- Hafif soyulma\n- Kızarıklık\n- Kuruluk\n- Geçici sivilce artışı (purging)\n\n## Kombinasyon Kuralları\n\n**Birlikte kullan:** Hyaluronic acid, Ceramide, SPF\n**Ayrı akşamlarda:** AHA/BHA\n**Kesinlikle kullanma:** Hamilelik/emzirme döneminde\n\n## Konsantrasyon Rehberi\n\n| Seviye | Konsantrasyon | Kimler İçin |\n|--------|--------------|-------------|\n| Başlangıç | %0.1-0.3 | İlk kez kullananlar |\n| Orta | %0.3-0.5 | 3+ ay deneyimli |\n| İleri | %0.5-1.0 | 6+ ay deneyimli |	published	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751
6	Güneş Kremi Rehberi: SPF, PA ve Doğru Seçim	gunes-kremi-rehberi-spf-pa	guide	Güneş korumasının önemi, SPF ve PA değerleri, kimyasal vs mineral filtreler, doğru güneş kremi seçimi.	## Neden Güneş Kremi?\n\nUV ışınları ciltte:\n- Erken yaşlanmanın %80'inden sorumludur\n- Hiperpigmentasyon ve lekelere yol açar\n- Cilt kanseri riskini artırır\n\n**Tek bir anti-aging ürün seçecek olsan, güneş kremi olmalı.**\n\n## SPF Ne Demek?\n\nSPF (Sun Protection Factor), UVB korumasını ölçer:\n- SPF 30: UVB'nin %97'sini engeller\n- SPF 50: UVB'nin %98'ini engeller\n\n## PA Değeri\n\nPA, UVA korumasını gösterir:\n- PA++++: Çok yüksek\n\n## Kimyasal vs Mineral\n\n### Kimyasal Filtreler\nUV'yi absorbe eder. Hafif doku, beyaz iz bırakmaz.\n\n### Mineral Filtreler\nUV'yi yansıtır. Hassas ciltlere uygun, hemen etkili.\n\n## Ne Kadar Sürmeliyiz?\n\n- Yüz için: Yaklaşık yarım çay kaşığı\n- 2 parmak kuralı: İşaret + orta parmak üzerine şerit çek\n- Her 2 saatte bir yeniden uygula\n\n## Cilt Tipine Göre Seçim\n\n| Cilt Tipi | Filtre Tipi | Doku |\n|-----------|-------------|------|\n| Yağlı | Kimyasal | Jel/fluid |\n| Kuru | Kimyasal/Karma | Krem |\n| Hassas | Mineral | Krem |\n| Sivilceli | Kimyasal | Oil-free jel |	published	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751
7	INCI Listesi Nasıl Okunur?	inci-listesi-nasil-okunur	guide	Kozmetik ürünlerin arkasındaki INCI listesini anlamak için temel rehber.	## INCI Nedir?\n\nINCI (International Nomenclature of Cosmetic Ingredients), kozmetik ürünlerin içerik listesini standartlaştıran uluslararası isimlendirme sistemidir.\n\n## Temel Kurallar\n\n### 1. Konsantrasyon Sıralaması\nİçerikler miktarına göre azalan sırada yazılır. İlk sıradakiler en yüksek konsantrasyondadır.\n\n### 2. %1 Eşiği\nGenellikle Phenoxyethanol veya benzeri koruyucular %1 sınırını işaret eder. Bu maddeden sonra yazılanlar çok düşük konsantrasyondadır.\n\n### 3. Latince İsimler\n- Bitkisel içerikler Latince yazılır: Aloe Barbadensis Leaf Extract\n- Kimyasal maddeler İngilizce: Niacinamide\n- Su her zaman: Aqua\n\n## Dikkat Edilecek Maddeler\n\n### Koruyucular\n- Phenoxyethanol — en yaygın, genellikle güvenli\n- Methylisothiazolinone (MI) — alerjik reaksiyon riski yüksek\n\n### Parfüm/Koku\n- Parfum veya Fragrance — hassas ciltler için risk\n- Limonene, Linalool — alerjen koku bileşenleri\n\n### Faydalı Aktifler\n- Niacinamide, Hyaluronic Acid, Retinol, Salicylic Acid\n\n## Okuma Stratejisi\n\n1. **İlk 5 maddeye bak** — ürünün %80+'ini oluşturur\n2. **Aktif maddenin yerini kontrol et** — üst sıralardaysa etkili dozda\n3. **Koruyucu sınırını bul** — aktifler bundan önce mi?\n4. **Hassasiyet maddelerini tara** — fragrance, alcohol denat\n\n## Platformumuzda Ne İşe Yarar?\n\nKozmetik Platform olarak her ürünün INCI listesini analiz ediyor, maddeleri tanımlıyor ve cilt ihtiyaçlarınıza uyumluluğunu skorluyoruz.	published	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751	2026-04-03 01:09:25.709751
\.


--
-- Data for Name: evidence_levels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evidence_levels (evidence_level_id, level_key, level_name, description, rank_order, badge_color, badge_emoji, is_active, created_at, updated_at) FROM stdin;
1	systematic_review	Sistematik Derleme	Birden fazla çalışmanın meta-analizi	1	#22c55e	🟢	t	2026-04-02 23:56:45.963721	2026-04-02 23:56:45.963721
2	randomized_controlled	Randomize Kontrollü	Altın standart klinik çalışma	2	#22c55e	🟢	t	2026-04-02 23:56:45.963721	2026-04-02 23:56:45.963721
3	cohort_study	Kohort Çalışması	Gözlemsel takip çalışması	3	#eab308	🟡	t	2026-04-02 23:56:45.963721	2026-04-02 23:56:45.963721
4	case_control	Vaka Kontrol	Geriye dönük karşılaştırma	4	#eab308	🟡	t	2026-04-02 23:56:45.963721	2026-04-02 23:56:45.963721
5	expert_opinion	Uzman Görüşü	Dermatolojist/kimyager konsensüsü	5	#f97316	🟠	t	2026-04-02 23:56:45.963721	2026-04-02 23:56:45.963721
6	in_vitro	In Vitro	Laboratuvar ortamı çalışması	6	#f97316	🟠	t	2026-04-02 23:56:45.963721	2026-04-02 23:56:45.963721
7	traditional_use	Geleneksel Kullanım	Uzun süreli geleneksel deneyim	7	#3b82f6	🔵	t	2026-04-02 23:56:45.963721	2026-04-02 23:56:45.963721
8	anecdotal	Anekdot	Bireysel deneyim ve gözlem	8	#3b82f6	🔵	t	2026-04-02 23:56:45.963721	2026-04-02 23:56:45.963721
\.


--
-- Data for Name: formula_revisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.formula_revisions (revision_id, product_id, previous_inci_text, new_inci_text, change_summary, changed_by, created_at) FROM stdin;
\.


--
-- Data for Name: ingredient_aliases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ingredient_aliases (alias_id, ingredient_id, alias_name, language, alias_type, created_at) FROM stdin;
1	1	Nikotinamid	tr	common	2026-04-02 23:56:51.98111
2	1	Vitamin B3	tr	common	2026-04-02 23:56:51.98111
3	2	A Vitamini	tr	common	2026-04-02 23:56:51.98111
4	3	Hyaluronik Asit	tr	common	2026-04-02 23:56:51.98111
5	3	HA	en	abbreviation	2026-04-02 23:56:51.98111
6	4	Salisilik Asit	tr	common	2026-04-02 23:56:51.98111
7	4	BHA	en	abbreviation	2026-04-02 23:56:51.98111
8	5	AHA	en	abbreviation	2026-04-02 23:56:51.98111
9	6	Seramid	tr	common	2026-04-02 23:56:51.98111
10	7	L-Ascorbic Acid	en	inci	2026-04-02 23:56:51.98111
11	7	C Vitamini	tr	common	2026-04-02 23:56:51.98111
12	8	Provitamin B5	en	common	2026-04-02 23:56:51.98111
13	8	Dekspantenol	tr	common	2026-04-02 23:56:51.98111
14	10	E Vitamini	tr	common	2026-04-02 23:56:51.98111
15	11	Tiger Grass	en	common	2026-04-02 23:56:51.98111
16	11	Cica	en	common	2026-04-02 23:56:51.98111
17	12	Gliserin	tr	common	2026-04-02 23:56:51.98111
18	13	Azelaik Asit	tr	common	2026-04-02 23:56:51.98111
19	14	Skualen	tr	common	2026-04-02 23:56:51.98111
\.


--
-- Data for Name: ingredient_evidence_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ingredient_evidence_links (link_id, ingredient_id, source_url, source_title, source_type, publication_year, summary_note, created_at) FROM stdin;
\.


--
-- Data for Name: ingredient_interactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ingredient_interactions (interaction_id, ingredient_a_id, ingredient_b_id, severity, domain_type, interaction_context, description, recommendation, source_url, is_active, created_at, updated_at) FROM stdin;
1	6	3	none	cosmetic	ingredient	Birlikte mükemmel çalışır — ceramide bariyeri güçlendirir, HA nemi çeker	Birlikte kullanımı önerilir	\N	t	2026-04-02 23:56:52.083786	2026-04-02 23:56:52.083786
2	5	4	moderate	cosmetic	ingredient	AHA ve BHA birlikte aşırı eksfoliasyona neden olabilir	Aynı anda kullanmayın, farklı günlere ayırın	\N	t	2026-04-02 23:56:52.083786	2026-04-02 23:56:52.083786
3	2	4	mild	cosmetic	ingredient	Retinol ve BHA birlikte dikkatli kullanılmalı	Cildiniz tolere ediyorsa kullanabilirsiniz, aksi halde farklı günlere ayırın	\N	t	2026-04-02 23:56:52.083786	2026-04-02 23:56:52.083786
4	2	5	moderate	cosmetic	ingredient	Retinol ve AHA birlikte kullanılmamalı — aşırı tahriş ve bariyer hasarı riski	Farklı günlerde veya sabah/akşam ayrı kullanın	\N	t	2026-04-02 23:56:52.083786	2026-04-02 23:56:52.083786
5	2	7	mild	cosmetic	ingredient	Retinol ve C vitamini birlikte etkisizleşebilir	C vitamini sabah, retinol akşam kullanın	\N	t	2026-04-02 23:56:52.083786	2026-04-02 23:56:52.083786
6	1	7	mild	cosmetic	ingredient	Birlikte flush (kızarıklık) riski — eski bilgi, modern formüllerde sorun yok	Modern formülasyonlarda birlikte kullanılabilir	\N	t	2026-04-02 23:56:52.083786	2026-04-02 23:56:52.083786
\.


--
-- Data for Name: ingredient_need_mappings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ingredient_need_mappings (ingredient_need_mapping_id, ingredient_id, need_id, relevance_score, effect_type, evidence_level, usage_context_note, created_at, updated_at) FROM stdin;
1	1	1	85	positive	\N	\N	2026-04-03 00:42:32.834706	2026-04-03 00:42:32.834706
2	1	2	80	positive	\N	\N	2026-04-03 00:42:32.988705	2026-04-03 00:42:32.988705
3	1	6	75	positive	\N	\N	2026-04-03 00:42:33.112845	2026-04-03 00:42:33.112845
4	1	5	70	positive	\N	\N	2026-04-03 00:42:33.192804	2026-04-03 00:42:33.192804
5	1	9	80	positive	\N	\N	2026-04-03 00:42:33.273952	2026-04-03 00:42:33.273952
6	2	3	95	positive	\N	\N	2026-04-03 00:42:33.357245	2026-04-03 00:42:33.357245
7	2	2	85	positive	\N	\N	2026-04-03 00:42:33.445165	2026-04-03 00:42:33.445165
8	2	1	70	positive	\N	\N	2026-04-03 00:42:33.534263	2026-04-03 00:42:33.534263
9	2	6	70	positive	\N	\N	2026-04-03 00:42:33.632112	2026-04-03 00:42:33.632112
10	3	4	95	positive	\N	\N	2026-04-03 00:42:33.730706	2026-04-03 00:42:33.730706
11	3	10	95	positive	\N	\N	2026-04-03 00:42:33.818588	2026-04-03 00:42:33.818588
12	3	3	60	positive	\N	\N	2026-04-03 00:42:33.915749	2026-04-03 00:42:33.915749
13	4	1	90	positive	\N	\N	2026-04-03 00:42:33.998002	2026-04-03 00:42:33.998002
14	4	6	85	positive	\N	\N	2026-04-03 00:42:34.080784	2026-04-03 00:42:34.080784
15	4	9	75	positive	\N	\N	2026-04-03 00:42:34.163025	2026-04-03 00:42:34.163025
16	5	2	80	positive	\N	\N	2026-04-03 00:42:34.235794	2026-04-03 00:42:34.235794
17	5	7	85	positive	\N	\N	2026-04-03 00:42:34.317246	2026-04-03 00:42:34.317246
18	5	3	65	positive	\N	\N	2026-04-03 00:42:34.441624	2026-04-03 00:42:34.441624
19	6	5	95	positive	\N	\N	2026-04-03 00:42:34.598753	2026-04-03 00:42:34.598753
20	6	4	85	positive	\N	\N	2026-04-03 00:42:34.852449	2026-04-03 00:42:34.852449
21	6	11	80	positive	\N	\N	2026-04-03 00:42:35.034206	2026-04-03 00:42:35.034206
22	7	12	95	positive	\N	\N	2026-04-03 00:42:35.158782	2026-04-03 00:42:35.158782
23	7	2	85	positive	\N	\N	2026-04-03 00:42:35.374188	2026-04-03 00:42:35.374188
24	7	7	80	positive	\N	\N	2026-04-03 00:42:35.539444	2026-04-03 00:42:35.539444
25	7	3	75	positive	\N	\N	2026-04-03 00:42:35.78143	2026-04-03 00:42:35.78143
26	8	5	80	positive	\N	\N	2026-04-03 00:42:36.029695	2026-04-03 00:42:36.029695
27	8	10	75	positive	\N	\N	2026-04-03 00:42:36.248332	2026-04-03 00:42:36.248332
28	8	11	85	positive	\N	\N	2026-04-03 00:42:36.448145	2026-04-03 00:42:36.448145
29	9	1	80	positive	\N	\N	2026-04-03 00:42:36.674906	2026-04-03 00:42:36.674906
30	9	9	85	positive	\N	\N	2026-04-03 00:42:36.89249	2026-04-03 00:42:36.89249
31	10	12	85	positive	\N	\N	2026-04-03 00:42:37.33479	2026-04-03 00:42:37.33479
32	10	3	60	positive	\N	\N	2026-04-03 00:42:37.501954	2026-04-03 00:42:37.501954
33	11	11	90	positive	\N	\N	2026-04-03 00:42:37.666231	2026-04-03 00:42:37.666231
34	11	5	85	positive	\N	\N	2026-04-03 00:42:37.823931	2026-04-03 00:42:37.823931
35	12	10	90	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
36	12	4	85	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
37	13	1	85	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
38	13	2	80	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
39	13	7	75	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
40	14	10	80	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
41	14	5	70	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
42	15	11	80	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
43	15	5	65	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
44	16	4	70	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
45	16	7	75	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
46	17	11	90	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
47	17	5	85	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
48	18	10	90	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
49	18	4	90	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
50	19	4	85	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
51	19	10	80	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
52	20	3	80	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
53	20	2	65	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
54	22	11	70	negative	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
55	25	10	60	positive	\N	\N	2026-04-03 00:43:37.543892	2026-04-03 00:43:37.543892
\.


--
-- Data for Name: ingredient_related_articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ingredient_related_articles (ingredient_related_article_id, ingredient_id, article_id) FROM stdin;
1	1	1
2	1	2
3	4	2
4	9	2
5	13	2
6	2	2
7	6	3
8	3	3
9	8	3
10	19	3
11	5	4
12	16	4
13	4	4
14	2	5
15	3	5
16	6	5
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ingredients (ingredient_id, domain_type, inci_name, common_name, ingredient_slug, ingredient_group, origin_type, function_summary, detailed_description, sensitivity_note, allergen_flag, fragrance_flag, preservative_flag, evidence_level, is_active, created_at, updated_at) FROM stdin;
1	cosmetic	Niacinamide	Niasinamid (B3 Vitamini)	niacinamide	Vitamin	synthetic	Gözenek sıkılaştırıcı, leke giderici, bariyer güçlendirici. Hemen her cilt tipine uygun çok yönlü aktif.	\N	\N	f	f	f	randomized_controlled	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
2	cosmetic	Retinol	Retinol (A Vitamini)	retinol	Vitamin	synthetic	Anti-aging altın standardı. Kırışıklık, leke ve akne üzerinde güçlü etki. Gece kullanımı gerektirir.	\N	\N	f	f	f	systematic_review	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
3	cosmetic	Hyaluronic Acid	Hyaluronik Asit	hyaluronic-acid	Nemlendirici	biotech	Kendi ağırlığının 1000 katı su tutan nemlendirici. Tüm cilt tipleri için uygun.	\N	\N	f	f	f	randomized_controlled	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
4	cosmetic	Salicylic Acid	Salisilik Asit	salicylic-acid	BHA	synthetic	Yağda çözünür eksfoliyant. Gözeneklerin derinlerine ulaşarak sivilce oluşumunu engeller.	\N	\N	f	f	f	randomized_controlled	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
5	cosmetic	Glycolic Acid	Glikolik Asit	glycolic-acid	AHA	synthetic	En küçük AHA molekülü. Ölü hücreleri arındırarak cilt yenilenmesini hızlandırır.	\N	\N	f	f	f	randomized_controlled	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
6	cosmetic	Ceramide NP	Seramid NP	ceramide-np	Lipid	synthetic	Cilt bariyerinin temel yapı taşı. Nem kaybını önler ve bariyeri onarır.	\N	\N	f	f	f	cohort_study	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
7	cosmetic	Ascorbic Acid	C Vitamini	ascorbic-acid	Vitamin	synthetic	Güçlü antioksidan. Leke giderici, kolajen sentezini destekler.	\N	\N	f	f	f	systematic_review	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
8	cosmetic	Panthenol	Panthenol (B5 Vitamini)	panthenol	Vitamin	synthetic	Yatıştırıcı ve nemlendirici. Cilt bariyerini güçlendirir.	\N	\N	f	f	f	randomized_controlled	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
9	cosmetic	Zinc PCA	Çinko PCA	zinc-pca	Mineral	synthetic	Sebum düzenleyici, anti-bakteriyel. Yağlı ve akne eğilimli cilde uygun.	\N	\N	f	f	f	cohort_study	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
10	cosmetic	Tocopherol	E Vitamini	tocopherol	Vitamin	natural	Güçlü antioksidan, nemlendirici ve iyileştirici.	\N	\N	f	f	f	systematic_review	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
11	cosmetic	Centella Asiatica Extract	Centella Asiatica Özütü	centella-asiatica-extract	Bitki Özütü	natural	Yatıştırıcı, iyileştirici, bariyer güçlendirici. Hassas ciltlere özel.	\N	\N	f	f	f	cohort_study	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
12	cosmetic	Glycerin	Gliserin	glycerin	Nemlendirici	synthetic	Temel nemlendirici humektant. Havadan nem çeker ve ciltte tutar.	\N	\N	f	f	f	systematic_review	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
13	cosmetic	Azelaic Acid	Azelaik Asit	azelaic-acid	Aktif	synthetic	Sivilce, leke ve rozasea için etkili. Antienflamatuar ve antibakteriyel.	\N	\N	f	f	f	randomized_controlled	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
14	cosmetic	Squalane	Skualan	squalane	Emoliyan	biotech	Cildin doğal yağına benzeyen hafif emoliyan. Gözenekleri tıkamaz.	\N	\N	f	f	f	expert_opinion	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
15	cosmetic	Allantoin	Allantoin	allantoin	Yatıştırıcı	synthetic	Cilt yatıştırıcı ve yumuşatıcı. Tahrişi azaltır.	\N	\N	f	f	f	cohort_study	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
16	cosmetic	Lactic Acid	Laktik Asit	lactic-acid	AHA	biotech	Hassas ciltler için uygun yumuşak AHA. Hem eksfoliye eder hem nemlendirir.	\N	\N	f	f	f	randomized_controlled	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
17	cosmetic	Madecassoside	Madesassosid	madecassoside	Bitki Özütü	natural	Centella türevi. Güçlü yatıştırıcı ve onarıcı.	\N	\N	f	f	f	cohort_study	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
18	cosmetic	Sodium Hyaluronate	Sodyum Hyaluronat	sodium-hyaluronate	Nemlendirici	biotech	Hyaluronik asidin tuzu. Daha küçük molekül, daha derin penetrasyon.	\N	\N	f	f	f	randomized_controlled	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
19	cosmetic	Urea	Üre	urea	Nemlendirici	synthetic	Güçlü humektant ve hafif keratolotik. Ekstra kuru ciltler için ideal.	\N	\N	f	f	f	systematic_review	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
20	cosmetic	Bakuchiol	Bakuchiol	bakuchiol	Bitki Özütü	natural	Retinol alternatifi bitkisel aktif. Hamilelikte de kullanılabilir.	\N	\N	f	f	f	randomized_controlled	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
21	cosmetic	Aqua	Su	aqua	Çözücü	natural	Tüm kozmetik formülasyonların temel çözücüsü.	\N	\N	f	f	f	expert_opinion	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
22	cosmetic	Parfum	Parfüm	parfum	Koku	synthetic	Ürüne koku veren bileşen karışımı. Hassas ciltler için tahriş riski taşır.	\N	\N	t	t	f	expert_opinion	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
23	cosmetic	Phenoxyethanol	Fenoksietanol	phenoxyethanol	Koruyucu	synthetic	Yaygın kullanılan koruyucu. Paraben alternatifi.	\N	\N	f	f	t	expert_opinion	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
24	cosmetic	Butylene Glycol	Butilen Glikol	butylene-glycol	Nemlendirici	synthetic	Hafif nemlendirici ve çözücü. Aktif maddelerin penetrasyonunu artırır.	\N	\N	f	f	f	expert_opinion	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
25	cosmetic	Dimethicone	Dimetikon	dimethicone	Silikon	synthetic	Cilt yüzeyini yumuşatan ve koruyan silikon. Tıkayıcı değildir.	\N	\N	f	f	f	expert_opinion	t	2026-04-02 23:56:51.952602	2026-04-02 23:56:51.952602
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1700000000000	Extensions1700000000000
2	1700000000001	InitialSchema1700000000001
3	1700000000002	Faz2Faz4Tables1700000000002
\.


--
-- Data for Name: need_related_articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.need_related_articles (need_related_article_id, need_id, article_id) FROM stdin;
1	1	2
2	2	1
3	2	5
4	3	5
5	3	6
6	4	3
7	5	3
8	6	1
9	6	4
10	7	4
11	8	6
12	9	2
13	10	3
14	11	3
\.


--
-- Data for Name: needs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.needs (need_id, domain_type, need_name, need_slug, need_group, short_description, detailed_description, user_friendly_label, is_active, created_at, updated_at) FROM stdin;
1	cosmetic	Sivilce / Akne	sivilce-akne	Cilt Sorunları	Sivilce ve akne eğilimli cilt bakımı	\N	Sivilce ve akne eğilimli cilt	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
2	cosmetic	Leke / Hiperpigmentasyon	leke-hiperpigmentasyon	Cilt Sorunları	Cilt lekesi ve ton eşitsizliği	\N	Leke ve ton eşitsizliği	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
3	cosmetic	Kırışıklık / Yaşlanma	kirisiklik-yaslanma	Cilt Sorunları	Kırışıklık ve erken yaşlanma belirtileri	\N	Kırışıklık ve yaşlanma karşıtı	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
4	cosmetic	Kuruluk / Dehidrasyon	kuruluk-dehidrasyon	Nem	Kuru ve dehidre cilt bakımı	\N	Kuru ve susuz cilt	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
5	cosmetic	Bariyer Desteği	bariyer-destegi	Bakım	Cilt bariyerini güçlendirme	\N	Hassas ve tahriş olmuş cilt	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
6	cosmetic	Gözenek Sıkılaştırma	gozenek-sikilastirma	Cilt Sorunları	Geniş gözenekleri sıkılaştırma	\N	Geniş gözenekler	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
7	cosmetic	Cilt Tonu Eşitleme	cilt-tonu-esitleme	Bakım	Cilt tonunu eşitleme ve aydınlatma	\N	Solgun ve eşitsiz cilt tonu	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
8	cosmetic	Güneş Koruması	gunes-korumasi	Koruma	UV ışınlarından koruma	\N	Güneşten korunma	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
9	cosmetic	Yağ Kontrolü	yag-kontrolu	Cilt Sorunları	Aşırı yağlanma kontrolü	\N	Yağlı ve parlak cilt	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
10	cosmetic	Nemlendirme	nemlendirme	Nem	Cilde nem takviyesi	\N	Nem ihtiyacı olan cilt	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
11	cosmetic	Hassasiyet	hassasiyet	Bakım	Hassas cilt bakımı	\N	Hassas ve reaktif cilt	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
12	cosmetic	Anti-Oksidan Koruma	anti-oksidan-koruma	Koruma	Serbest radikal hasarına karşı koruma	\N	Çevresel etkenlerden koruma	t	2026-04-02 23:56:51.928948	2026-04-02 23:56:51.928948
13	supplement	Enerji & Canlılık	enerji-canlilik	Genel Sağlık	Enerji düzeyini artırmaya destek	\N	Enerji ve canlılık desteği	t	2026-04-02 23:56:52.080947	2026-04-02 23:56:52.080947
14	supplement	Bağışıklık Desteği	bagisiklik-destegi	Genel Sağlık	Bağışıklık sistemini destekleme	\N	Bağışıklık güçlendirme	t	2026-04-02 23:56:52.080947	2026-04-02 23:56:52.080947
15	supplement	Sindirim Sağlığı	sindirim-sagligi	Sindirim	Sindirim sistemi dengesini koruma	\N	Sindirim düzeni desteği	t	2026-04-02 23:56:52.080947	2026-04-02 23:56:52.080947
16	supplement	Kemik & Eklem	kemik-eklem	Kas-İskelet	Kemik ve eklem sağlığını destekleme	\N	Kemik ve eklem güçlendirme	t	2026-04-02 23:56:52.080947	2026-04-02 23:56:52.080947
\.


--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.price_history (price_history_id, affiliate_link_id, price, in_stock, currency, recorded_at) FROM stdin;
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (image_id, product_id, image_url, image_type, sort_order, alt_text, created_at) FROM stdin;
1	1	https://placehold.co/600x600/f0f4f8/1a1a2e?text=CeraVe+Cream	product	1	CeraVe Moisturising Cream	2026-04-03 01:04:40.524724
2	2	https://placehold.co/600x600/f0f4f8/1a1a2e?text=CeraVe+Cleanser	product	1	CeraVe Foaming Cleanser	2026-04-03 01:04:40.524724
3	3	https://placehold.co/600x600/f0f4f8/1a1a2e?text=CeraVe+PM	product	1	CeraVe PM Lotion	2026-04-03 01:04:40.524724
4	4	https://placehold.co/600x600/e8f0fe/1a1a2e?text=LRP+Effaclar	product	1	La Roche-Posay Effaclar Duo+	2026-04-03 01:04:40.524724
5	5	https://placehold.co/600x600/e8f0fe/1a1a2e?text=LRP+Anthelios	product	1	La Roche-Posay Anthelios UVMUNE 400	2026-04-03 01:04:40.524724
6	6	https://placehold.co/600x600/e8f0fe/1a1a2e?text=LRP+Cicaplast	product	1	La Roche-Posay Cicaplast Baume B5+	2026-04-03 01:04:40.524724
7	7	https://placehold.co/600x600/fef0e8/1a1a2e?text=Bioderma+Sensibio	product	1	Bioderma Sensibio H2O	2026-04-03 01:04:40.524724
8	8	https://placehold.co/600x600/fef0e8/1a1a2e?text=Bioderma+Sebium	product	1	Bioderma Sebium Global	2026-04-03 01:04:40.524724
9	9	https://placehold.co/600x600/f0f8f0/1a1a2e?text=Avene+Cicalfate	product	1	Avene Cicalfate+ Onarici Krem	2026-04-03 01:04:40.524724
10	10	https://placehold.co/600x600/f0f8f0/1a1a2e?text=Avene+Tolerance	product	1	Avene Tolerance Extreme Emulsion	2026-04-03 01:04:40.524724
11	11	https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Niacinamide	product	1	The Ordinary Niacinamide 10% + Zinc 1%	2026-04-03 01:04:40.524724
12	12	https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Hyaluronic	product	1	The Ordinary Hyaluronic Acid 2% + B5	2026-04-03 01:04:40.524724
13	13	https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Retinol	product	1	The Ordinary Retinol 0.5% in Squalane	2026-04-03 01:04:40.524724
14	14	https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+AHA+BHA	product	1	The Ordinary AHA 30% + BHA 2% Peeling	2026-04-03 01:04:40.524724
15	15	https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Vitamin+C	product	1	The Ordinary Ascorbic Acid 8%	2026-04-03 01:04:40.524724
16	16	https://placehold.co/600x600/fff8f0/1a1a2e?text=TO+Azelaic	product	1	The Ordinary Azelaic Acid 10%	2026-04-03 01:04:40.524724
17	17	https://placehold.co/600x600/f8f0ff/1a1a2e?text=COSRX+Snail	product	1	COSRX Snail 96 Mucin Essence	2026-04-03 01:04:40.524724
18	18	https://placehold.co/600x600/f8f0ff/1a1a2e?text=COSRX+Cleanser	product	1	COSRX Good Morning Gel Cleanser	2026-04-03 01:04:40.524724
19	19	https://placehold.co/600x600/f8f0ff/1a1a2e?text=COSRX+BHA	product	1	COSRX BHA Blackhead Power Liquid	2026-04-03 01:04:40.524724
20	20	https://placehold.co/600x600/e0f0ff/1a1a2e?text=Neutrogena+Hydro	product	1	Neutrogena Hydro Boost Water Gel	2026-04-03 01:04:40.524724
21	21	https://placehold.co/600x600/e0f0ff/1a1a2e?text=Neutrogena+SPF55	product	1	Neutrogena Ultra Sheer SPF55	2026-04-03 01:04:40.524724
22	22	https://placehold.co/600x600/f0ffe0/1a1a2e?text=SVR+Sebiaclear	product	1	SVR Sebiaclear Serum	2026-04-03 01:04:40.524724
23	23	https://placehold.co/600x600/f0ffe0/1a1a2e?text=SVR+Ampoule+B3	product	1	SVR Ampoule B3 Hydra	2026-04-03 01:04:40.524724
24	24	https://placehold.co/600x600/fff0f0/1a1a2e?text=Eucerin+Urea	product	1	Eucerin UreaRepair Plus Krem	2026-04-03 01:04:40.524724
25	25	https://placehold.co/600x600/fff0f0/1a1a2e?text=Eucerin+Oil+Ctrl	product	1	Eucerin DermoPurifyer Oil Control	2026-04-03 01:04:40.524724
\.


--
-- Data for Name: product_ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_ingredients (product_ingredient_id, product_id, ingredient_id, ingredient_display_name, inci_order_rank, listed_as_raw, concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims, match_status, match_confidence, created_at, updated_at) FROM stdin;
1	1	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
2	1	12	Glycerin	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
3	1	25	Dimethicone	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
4	1	6	Ceramide NP	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
5	1	3	Hyaluronic Acid	5	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
6	1	24	Butylene Glycol	6	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
7	1	23	Phenoxyethanol	7	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
8	2	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
9	2	12	Glycerin	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
10	2	1	Niacinamide	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
11	2	6	Ceramide NP	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
12	2	3	Hyaluronic Acid	5	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
13	2	23	Phenoxyethanol	6	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
14	3	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
15	3	12	Glycerin	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
16	3	1	Niacinamide	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
17	3	25	Dimethicone	4	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
18	3	6	Ceramide NP	5	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
19	3	3	Hyaluronic Acid	6	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
20	3	10	Tocopherol	7	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
21	3	23	Phenoxyethanol	8	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
22	4	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
23	4	12	Glycerin	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
24	4	1	Niacinamide	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
25	4	4	Salicylic Acid	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
26	4	25	Dimethicone	5	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
27	4	23	Phenoxyethanol	6	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
28	5	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
29	5	12	Glycerin	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
30	5	25	Dimethicone	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
31	5	10	Tocopherol	4	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
32	6	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
33	6	12	Glycerin	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
34	6	8	Panthenol	3	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
35	6	25	Dimethicone	4	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
36	6	17	Madecassoside	5	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
37	6	9	Zinc PCA	6	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
38	7	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
39	7	12	Glycerin	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
40	7	15	Allantoin	3	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
41	7	23	Phenoxyethanol	4	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
42	8	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
43	8	12	Glycerin	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
44	8	4	Salicylic Acid	3	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
45	8	9	Zinc PCA	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
46	8	15	Allantoin	5	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
47	9	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
48	9	12	Glycerin	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
49	9	25	Dimethicone	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
50	9	15	Allantoin	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
51	9	8	Panthenol	5	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
52	10	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
53	10	14	Squalane	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
54	10	12	Glycerin	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
55	11	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
56	11	1	Niacinamide	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
57	11	9	Zinc PCA	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
58	11	12	Glycerin	4	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
59	11	23	Phenoxyethanol	5	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
60	12	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
61	12	18	Sodium Hyaluronate	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
62	12	3	Hyaluronic Acid	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
63	12	8	Panthenol	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
64	12	23	Phenoxyethanol	5	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
65	13	14	Squalane	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
66	13	2	Retinol	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
67	13	24	Butylene Glycol	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
68	14	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
69	14	5	Glycolic Acid	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
70	14	16	Lactic Acid	3	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
71	14	4	Salicylic Acid	4	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
72	14	24	Butylene Glycol	5	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
73	15	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
74	15	7	Ascorbic Acid	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
75	15	24	Butylene Glycol	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
76	15	23	Phenoxyethanol	4	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
77	16	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
78	16	13	Azelaic Acid	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
79	16	25	Dimethicone	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
80	16	23	Phenoxyethanol	4	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
81	17	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
82	17	18	Sodium Hyaluronate	2	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
83	17	15	Allantoin	3	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
84	17	8	Panthenol	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
85	18	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
86	18	12	Glycerin	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
87	18	11	Centella Asiatica Extract	3	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
88	19	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
89	19	4	Salicylic Acid	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
90	19	24	Butylene Glycol	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
91	19	15	Allantoin	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
92	20	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
93	20	12	Glycerin	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
94	20	3	Hyaluronic Acid	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
95	20	25	Dimethicone	4	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
96	20	23	Phenoxyethanol	5	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
97	21	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
98	21	12	Glycerin	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
99	21	25	Dimethicone	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
100	21	10	Tocopherol	4	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
101	22	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
102	22	1	Niacinamide	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
103	22	12	Glycerin	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
104	22	4	Salicylic Acid	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
105	23	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
106	23	1	Niacinamide	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
107	23	3	Hyaluronic Acid	3	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
108	23	8	Panthenol	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
109	24	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
110	24	12	Glycerin	2	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
111	24	19	Urea	3	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
112	24	6	Ceramide NP	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
113	24	23	Phenoxyethanol	5	\N	trace	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
114	25	21	Aqua	1	\N	high	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
115	25	12	Glycerin	2	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
116	25	4	Salicylic Acid	3	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
117	25	1	Niacinamide	4	\N	low	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
118	25	25	Dimethicone	5	\N	medium	f	f	auto	1.00	2026-04-03 00:45:51.476771	2026-04-03 00:45:51.476771
\.


--
-- Data for Name: product_labels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_labels (product_label_id, product_id, inci_raw_text, ingredient_header_text, usage_instructions, warning_text, manufacturer_info, distributor_info, origin_info, batch_reference, expiry_info, pao_info, net_content_display, packaging_symbols_json, claim_texts_json, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_masters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_masters (master_id, brand_id, category_id, master_name, domain_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_need_scores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_need_scores (product_need_score_id, product_id, need_id, compatibility_score, score_reason_summary, explanation_logic, confidence_level, calculated_at) FROM stdin;
1	1	4	87.50	\N	{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 6}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}], "matched_count": 3}	high	2026-04-03 03:46:24.133
2	1	10	80.65	\N	{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}], "matched_count": 3}	high	2026-04-03 03:46:24.133
3	1	3	60.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 3}], "matched_count": 1}	medium	2026-04-03 03:46:24.133
4	1	5	95.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 6}], "matched_count": 1}	medium	2026-04-03 03:46:24.134
5	1	11	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 6}], "matched_count": 1}	medium	2026-04-03 03:46:24.134
6	2	1	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:24.375
7	2	2	80.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:24.375
8	2	6	75.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:24.375
9	2	5	79.62	\N	{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 1}, {"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 6}], "matched_count": 2}	medium	2026-04-03 03:46:24.375
10	2	9	80.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:24.375
11	2	4	87.78	\N	{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 6}, {"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 3}	high	2026-04-03 03:46:24.375
12	2	10	91.92	\N	{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}], "matched_count": 2}	medium	2026-04-03 03:46:24.375
13	2	3	60.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 60, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 3}], "matched_count": 1}	medium	2026-04-03 03:46:24.375
14	2	11	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 6}], "matched_count": 1}	medium	2026-04-03 03:46:24.375
15	3	1	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:24.481
16	3	2	80.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:24.481
17	3	6	75.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:24.481
18	3	5	79.62	\N	{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 1}, {"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 6}], "matched_count": 2}	medium	2026-04-03 03:46:24.481
19	3	9	80.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:24.481
20	3	4	86.89	\N	{"ingredients": [{"strength": 0.35, "relevance": 95, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 3}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 6}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}], "matched_count": 3}	high	2026-04-03 03:46:24.481
21	3	10	79.65	\N	{"ingredients": [{"strength": 0.35, "relevance": 95, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 3}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}], "matched_count": 3}	high	2026-04-03 03:46:24.481
22	3	3	60.00	\N	{"ingredients": [{"strength": 0.35, "relevance": 60, "effect_type": "positive", "contribution": 0.21, "ingredient_id": 3}, {"strength": 0.14, "relevance": 60, "effect_type": "positive", "contribution": 0.08, "ingredient_id": 10}], "matched_count": 2}	medium	2026-04-03 03:46:24.481
23	3	11	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 6}], "matched_count": 1}	medium	2026-04-03 03:46:24.481
24	3	12	85.00	\N	{"ingredients": [{"strength": 0.14, "relevance": 85, "effect_type": "positive", "contribution": 0.12, "ingredient_id": 10}], "matched_count": 1}	medium	2026-04-03 03:46:24.481
25	4	1	86.92	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 1}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}], "matched_count": 2}	medium	2026-04-03 03:46:24.605
26	4	2	80.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:24.605
27	4	6	78.85	\N	{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 1}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 2}	medium	2026-04-03 03:46:24.605
28	4	5	70.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:24.605
29	4	9	78.08	\N	{"ingredients": [{"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 1}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}], "matched_count": 2}	medium	2026-04-03 03:46:24.605
30	4	10	75.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}], "matched_count": 2}	medium	2026-04-03 03:46:24.605
31	4	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:24.605
32	5	12	85.00	\N	{"ingredients": [{"strength": 0.2, "relevance": 85, "effect_type": "positive", "contribution": 0.17, "ingredient_id": 10}], "matched_count": 1}	medium	2026-04-03 03:46:24.701
33	5	3	60.00	\N	{"ingredients": [{"strength": 0.2, "relevance": 60, "effect_type": "positive", "contribution": 0.12, "ingredient_id": 10}], "matched_count": 1}	medium	2026-04-03 03:46:24.701
34	5	10	75.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}], "matched_count": 2}	medium	2026-04-03 03:46:24.701
35	5	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:24.701
36	6	5	81.67	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 8}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 17}], "matched_count": 2}	medium	2026-04-03 03:46:24.816
37	6	10	76.07	\N	{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 8}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}], "matched_count": 3}	high	2026-04-03 03:46:24.816
38	6	11	86.67	\N	{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 8}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 17}], "matched_count": 2}	medium	2026-04-03 03:46:24.816
39	6	1	80.00	\N	{"ingredients": [{"strength": 0.35, "relevance": 80, "effect_type": "positive", "contribution": 0.28, "ingredient_id": 9}], "matched_count": 1}	medium	2026-04-03 03:46:24.816
40	6	9	85.00	\N	{"ingredients": [{"strength": 0.35, "relevance": 85, "effect_type": "positive", "contribution": 0.3, "ingredient_id": 9}], "matched_count": 1}	medium	2026-04-03 03:46:24.816
41	6	4	85.00	\N	{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:24.816
42	7	10	90.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:24.935
43	7	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:24.935
44	7	11	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}], "matched_count": 1}	medium	2026-04-03 03:46:24.935
45	7	5	65.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}], "matched_count": 1}	medium	2026-04-03 03:46:24.935
46	8	1	85.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 9}], "matched_count": 2}	medium	2026-04-03 03:46:25.05
47	8	6	85.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 1}	medium	2026-04-03 03:46:25.05
48	8	9	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 9}], "matched_count": 2}	medium	2026-04-03 03:46:25.05
49	8	10	90.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.05
50	8	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.05
51	8	11	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}], "matched_count": 1}	medium	2026-04-03 03:46:25.05
52	8	5	65.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}], "matched_count": 1}	medium	2026-04-03 03:46:25.05
53	9	5	72.50	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 8}, {"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}], "matched_count": 2}	medium	2026-04-03 03:46:25.164
54	9	10	75.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 8}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}], "matched_count": 3}	high	2026-04-03 03:46:25.164
55	9	11	82.50	\N	{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 8}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}], "matched_count": 2}	medium	2026-04-03 03:46:25.164
56	9	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.164
57	10	10	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 14}], "matched_count": 2}	medium	2026-04-03 03:46:25.278
58	10	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.278
59	10	5	70.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 14}], "matched_count": 1}	medium	2026-04-03 03:46:25.278
60	11	1	82.78	\N	{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 1}, {"strength": 0.8, "relevance": 80, "effect_type": "positive", "contribution": 0.64, "ingredient_id": 9}], "matched_count": 2}	medium	2026-04-03 03:46:25.291
61	11	2	80.00	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:25.291
62	11	6	75.00	\N	{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:25.291
63	11	5	70.00	\N	{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:25.291
64	11	9	82.22	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}, {"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 9}], "matched_count": 2}	medium	2026-04-03 03:46:25.291
65	11	10	90.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.291
66	11	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.291
67	12	4	92.50	\N	{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 18}], "matched_count": 2}	medium	2026-04-03 03:46:25.396
68	12	10	88.33	\N	{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 8}, {"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 18}], "matched_count": 3}	high	2026-04-03 03:46:25.396
69	12	3	60.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}], "matched_count": 1}	medium	2026-04-03 03:46:25.396
70	12	5	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 8}], "matched_count": 1}	medium	2026-04-03 03:46:25.396
71	12	11	85.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 8}], "matched_count": 1}	medium	2026-04-03 03:46:25.396
72	13	3	95.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 2}], "matched_count": 1}	medium	2026-04-03 03:46:25.503
73	13	2	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 2}], "matched_count": 1}	medium	2026-04-03 03:46:25.503
74	13	1	70.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 2}], "matched_count": 1}	medium	2026-04-03 03:46:25.503
75	13	6	70.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 70, "effect_type": "positive", "contribution": 0.56, "ingredient_id": 2}], "matched_count": 1}	medium	2026-04-03 03:46:25.503
76	13	10	80.00	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 14}], "matched_count": 1}	medium	2026-04-03 03:46:25.503
77	13	5	70.00	\N	{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 14}], "matched_count": 1}	medium	2026-04-03 03:46:25.503
78	14	1	90.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 4}], "matched_count": 1}	medium	2026-04-03 03:46:25.608
79	14	6	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 4}], "matched_count": 1}	medium	2026-04-03 03:46:25.608
80	14	9	75.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 4}], "matched_count": 1}	medium	2026-04-03 03:46:25.608
81	14	2	80.00	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 5}], "matched_count": 1}	medium	2026-04-03 03:46:25.608
82	14	7	80.00	\N	{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 5}, {"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 16}], "matched_count": 2}	medium	2026-04-03 03:46:25.608
83	14	3	65.00	\N	{"ingredients": [{"strength": 1, "relevance": 65, "effect_type": "positive", "contribution": 0.65, "ingredient_id": 5}], "matched_count": 1}	medium	2026-04-03 03:46:25.608
84	14	4	70.00	\N	{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 16}], "matched_count": 1}	medium	2026-04-03 03:46:25.608
85	15	12	95.00	\N	{"ingredients": [{"strength": 1, "relevance": 95, "effect_type": "positive", "contribution": 0.95, "ingredient_id": 7}], "matched_count": 1}	medium	2026-04-03 03:46:25.62
86	15	2	85.00	\N	{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 7}], "matched_count": 1}	medium	2026-04-03 03:46:25.62
87	15	7	80.00	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 7}], "matched_count": 1}	medium	2026-04-03 03:46:25.62
88	15	3	75.00	\N	{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 7}], "matched_count": 1}	medium	2026-04-03 03:46:25.62
89	16	1	85.00	\N	{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 13}], "matched_count": 1}	medium	2026-04-03 03:46:25.724
90	16	2	80.00	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 13}], "matched_count": 1}	medium	2026-04-03 03:46:25.724
91	16	7	75.00	\N	{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 13}], "matched_count": 1}	medium	2026-04-03 03:46:25.724
92	16	10	60.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}], "matched_count": 1}	medium	2026-04-03 03:46:25.724
93	17	5	72.50	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 8}, {"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}], "matched_count": 2}	medium	2026-04-03 03:46:25.844
94	17	10	82.50	\N	{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 8}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 18}], "matched_count": 2}	medium	2026-04-03 03:46:25.844
95	17	11	82.50	\N	{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 8}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}], "matched_count": 2}	medium	2026-04-03 03:46:25.844
96	17	4	90.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 18}], "matched_count": 1}	medium	2026-04-03 03:46:25.844
97	18	11	90.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 11}], "matched_count": 1}	medium	2026-04-03 03:46:25.894
98	18	5	85.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 11}], "matched_count": 1}	medium	2026-04-03 03:46:25.894
99	18	10	90.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.894
100	18	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.894
101	19	1	90.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 4}], "matched_count": 1}	medium	2026-04-03 03:46:25.91
102	19	6	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 4}], "matched_count": 1}	medium	2026-04-03 03:46:25.91
103	19	9	75.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 75, "effect_type": "positive", "contribution": 0.6, "ingredient_id": 4}], "matched_count": 1}	medium	2026-04-03 03:46:25.91
104	19	11	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 15}], "matched_count": 1}	medium	2026-04-03 03:46:25.91
105	19	5	65.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 65, "effect_type": "positive", "contribution": 0.33, "ingredient_id": 15}], "matched_count": 1}	medium	2026-04-03 03:46:25.91
106	20	4	89.44	\N	{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}], "matched_count": 2}	medium	2026-04-03 03:46:25.925
107	20	10	82.31	\N	{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}], "matched_count": 3}	high	2026-04-03 03:46:25.925
108	20	3	60.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}], "matched_count": 1}	medium	2026-04-03 03:46:25.925
109	21	12	85.00	\N	{"ingredients": [{"strength": 0.2, "relevance": 85, "effect_type": "positive", "contribution": 0.17, "ingredient_id": 10}], "matched_count": 1}	medium	2026-04-03 03:46:25.942
110	21	3	60.00	\N	{"ingredients": [{"strength": 0.2, "relevance": 60, "effect_type": "positive", "contribution": 0.12, "ingredient_id": 10}], "matched_count": 1}	medium	2026-04-03 03:46:25.942
111	21	10	75.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}], "matched_count": 2}	medium	2026-04-03 03:46:25.942
112	21	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.942
113	22	1	86.67	\N	{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 1}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}], "matched_count": 2}	medium	2026-04-03 03:46:25.962
114	22	2	80.00	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:25.962
115	22	6	78.33	\N	{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 1}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 2}	medium	2026-04-03 03:46:25.962
116	22	5	70.00	\N	{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:25.962
117	22	9	78.33	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}], "matched_count": 2}	medium	2026-04-03 03:46:25.962
118	22	10	90.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.962
119	22	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:25.962
120	23	1	85.00	\N	{"ingredients": [{"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:26.062
121	23	2	80.00	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:26.062
122	23	6	75.00	\N	{"ingredients": [{"strength": 1, "relevance": 75, "effect_type": "positive", "contribution": 0.75, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:26.062
123	23	5	73.33	\N	{"ingredients": [{"strength": 1, "relevance": 70, "effect_type": "positive", "contribution": 0.7, "ingredient_id": 1}, {"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 8}], "matched_count": 2}	medium	2026-04-03 03:46:26.062
124	23	9	80.00	\N	{"ingredients": [{"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:26.062
125	23	4	95.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}], "matched_count": 1}	medium	2026-04-03 03:46:26.062
126	23	10	87.31	\N	{"ingredients": [{"strength": 0.8, "relevance": 95, "effect_type": "positive", "contribution": 0.76, "ingredient_id": 3}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 8}], "matched_count": 2}	medium	2026-04-03 03:46:26.062
127	23	3	60.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 3}], "matched_count": 1}	medium	2026-04-03 03:46:26.062
128	23	11	85.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 8}], "matched_count": 1}	medium	2026-04-03 03:46:26.062
129	24	5	95.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 95, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 6}], "matched_count": 1}	medium	2026-04-03 03:46:26.076
130	24	4	85.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 6}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 12}, {"strength": 1, "relevance": 85, "effect_type": "positive", "contribution": 0.85, "ingredient_id": 19}], "matched_count": 3}	high	2026-04-03 03:46:26.076
131	24	11	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 6}], "matched_count": 1}	medium	2026-04-03 03:46:26.076
132	24	10	85.00	\N	{"ingredients": [{"strength": 1, "relevance": 90, "effect_type": "positive", "contribution": 0.9, "ingredient_id": 12}, {"strength": 1, "relevance": 80, "effect_type": "positive", "contribution": 0.8, "ingredient_id": 19}], "matched_count": 2}	medium	2026-04-03 03:46:26.076
133	25	1	87.50	\N	{"ingredients": [{"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 1}, {"strength": 0.5, "relevance": 90, "effect_type": "positive", "contribution": 0.45, "ingredient_id": 4}], "matched_count": 2}	medium	2026-04-03 03:46:26.191
134	25	2	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:26.191
135	25	6	80.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 1}, {"strength": 0.5, "relevance": 85, "effect_type": "positive", "contribution": 0.43, "ingredient_id": 4}], "matched_count": 2}	medium	2026-04-03 03:46:26.191
136	25	5	70.00	\N	{"ingredients": [{"strength": 0.5, "relevance": 70, "effect_type": "positive", "contribution": 0.35, "ingredient_id": 1}], "matched_count": 1}	medium	2026-04-03 03:46:26.191
137	25	9	77.50	\N	{"ingredients": [{"strength": 0.5, "relevance": 80, "effect_type": "positive", "contribution": 0.4, "ingredient_id": 1}, {"strength": 0.5, "relevance": 75, "effect_type": "positive", "contribution": 0.38, "ingredient_id": 4}], "matched_count": 2}	medium	2026-04-03 03:46:26.191
138	25	10	75.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 90, "effect_type": "positive", "contribution": 0.72, "ingredient_id": 12}, {"strength": 0.8, "relevance": 60, "effect_type": "positive", "contribution": 0.48, "ingredient_id": 25}], "matched_count": 2}	medium	2026-04-03 03:46:26.191
139	25	4	85.00	\N	{"ingredients": [{"strength": 0.8, "relevance": 85, "effect_type": "positive", "contribution": 0.68, "ingredient_id": 12}], "matched_count": 1}	medium	2026-04-03 03:46:26.191
\.


--
-- Data for Name: product_related_articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_related_articles (product_related_article_id, product_id, article_id) FROM stdin;
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variants (variant_id, master_id, region, size_label, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (product_id, variant_id, brand_id, category_id, domain_type, product_name, product_slug, product_type_label, short_description, barcode, net_content_value, net_content_unit, target_area, usage_time_hint, status, created_at, updated_at) FROM stdin;
7	\N	4	2	cosmetic	Bioderma Sensibio H2O	bioderma-sensibio-h2o	temizleyici	Hassas ciltler için misel su	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
8	\N	4	1	cosmetic	Bioderma Sebium Global	bioderma-sebium-global	bakım	Akne eğilimli ciltler için global bakım	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
9	\N	5	1	cosmetic	Avene Cicalfate+ Onarıcı Krem	avene-cicalfate-onarici-krem	onarıcı	Hassas ve irritasyonlu ciltler için onarıcı krem	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
10	\N	5	1	cosmetic	Avene Tolerance Extreme Emulsion	avene-tolerance-extreme	nemlendirici	Ultra hassas ciltler için minimalist nemlendirici	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
1	\N	2	1	cosmetic	CeraVe Moisturising Cream	cerave-moisturising-cream	nemlendirici	Kuru ve çok kuru ciltler için ceramide içerikli yoğun nemlendirici krem	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
2	\N	2	2	cosmetic	CeraVe Foaming Cleanser	cerave-foaming-cleanser	temizleyici	Normal ve yağlı ciltler için köpüren temizleyici jel	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
3	\N	2	1	cosmetic	CeraVe PM Facial Moisturising Lotion	cerave-pm-lotion	nemlendirici	Niacinamide içeren gece nemlendirici losyon	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
4	\N	1	1	cosmetic	La Roche-Posay Effaclar Duo+	lrp-effaclar-duo-plus	bakım	Sivilce eğilimli ciltler için bakım kremi	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
5	\N	1	3	cosmetic	La Roche-Posay Anthelios UVMUNE 400 SPF50+	lrp-anthelios-uvmune-400	güneş kremi	Çok yüksek koruma güneş kremi	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
6	\N	1	1	cosmetic	La Roche-Posay Cicaplast Baume B5+	lrp-cicaplast-baume-b5	onarıcı	Hassas ve irritasyonlu ciltler için onarıcı bariyer balm	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
20	\N	8	1	cosmetic	Neutrogena Hydro Boost Water Gel	neutrogena-hydro-boost	nemlendirici	Hyaluronik asit içeren su bazlı jel nemlendirici	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
21	\N	8	3	cosmetic	Neutrogena Ultra Sheer Dry-Touch SPF55	neutrogena-ultra-sheer-spf55	güneş kremi	Mat bitişli güneş kremi	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
18	\N	13	2	cosmetic	COSRX Low pH Good Morning Gel Cleanser	cosrx-low-ph-cleanser	temizleyici	Düşük pH jel temizleyici	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
11	\N	3	1	cosmetic	The Ordinary Niacinamide 10% + Zinc 1%	to-niacinamide-zinc	serum	Gözenek sıkılaştırıcı ve yağ dengeleyici serum	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
12	\N	3	1	cosmetic	The Ordinary Hyaluronic Acid 2% + B5	to-hyaluronic-acid-b5	serum	Multi-ağırlık hyaluronik asit nemlendirici serum	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
13	\N	3	1	cosmetic	The Ordinary Retinol 0.5% in Squalane	to-retinol-05-squalane	serum	Orta güçte retinol serumu	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
14	\N	3	1	cosmetic	The Ordinary AHA 30% + BHA 2% Peeling Solution	to-aha-bha-peeling	peeling	10 dakikalık eksfoliyan peeling	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
15	\N	3	1	cosmetic	The Ordinary Ascorbic Acid 8% + Alpha Arbutin 2%	to-ascorbic-acid-alpha-arbutin	serum	Aydınlatıcı C vitamini serumu	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
16	\N	3	1	cosmetic	The Ordinary Azelaic Acid Suspension 10%	to-azelaic-acid-10	bakım	Leke karşıtı ve sivilce bakım ürünü	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
22	\N	6	1	cosmetic	SVR Sebiaclear Serum	svr-sebiaclear-serum	serum	Niacinamide + gluconolactone sivilce serumu	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
23	\N	6	1	cosmetic	SVR Ampoule B3 Hydra	svr-ampoule-b3-hydra	serum	Niacinamide yoğun nemlendirici ampul	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
17	\N	13	1	cosmetic	COSRX Advanced Snail 96 Mucin Power Essence	cosrx-snail-96-essence	esans	Salyangoz müsini ile onarıcı ve nemlendirici esans	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
19	\N	13	1	cosmetic	COSRX BHA Blackhead Power Liquid	cosrx-bha-blackhead-liquid	tonik	Salisilik asit içeren siyah nokta bakım toniği	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
24	\N	7	1	cosmetic	Eucerin UreaRepair Plus %5 Urea Krem	eucerin-urearepair-5	nemlendirici	%5 Urea içeren yoğun nemlendirici	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
25	\N	7	1	cosmetic	Eucerin DermoPurifyer Oil Control Jel Krem	eucerin-dermopurifyer-jel-krem	bakım	Yağlı ve akne eğilimli ciltler için mat bakım	\N	\N	\N	\N	\N	published	2026-04-03 00:44:26.330898	2026-04-03 00:44:26.330898
\.


--
-- Data for Name: scoring_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scoring_configs (config_id, config_key, config_value, description, config_group, created_at, updated_at) FROM stdin;
1	rank_weight_need_compat	0.500	ProductRankScore: Need uyumu ağırlığı	scoring	2026-04-02 23:56:52.033564	2026-04-02 23:56:52.033564
2	rank_weight_strength	0.200	ProductRankScore: Ingredient gücü ağırlığı	scoring	2026-04-02 23:56:52.033564	2026-04-02 23:56:52.033564
3	rank_weight_label	0.150	ProductRankScore: Etiket tutarlılığı ağırlığı	scoring	2026-04-02 23:56:52.033564	2026-04-02 23:56:52.033564
4	rank_weight_completeness	0.150	ProductRankScore: İçerik tamlığı ağırlığı	scoring	2026-04-02 23:56:52.033564	2026-04-02 23:56:52.033564
5	penalty_fragrance	0.600	Hassasiyet cezası: Parfüm	sensitivity	2026-04-02 23:56:52.033564	2026-04-02 23:56:52.033564
6	penalty_alcohol	0.700	Hassasiyet cezası: Alkol	sensitivity	2026-04-02 23:56:52.033564	2026-04-02 23:56:52.033564
7	penalty_paraben	0.800	Hassasiyet cezası: Paraben	sensitivity	2026-04-02 23:56:52.033564	2026-04-02 23:56:52.033564
8	penalty_essential_oils	0.750	Hassasiyet cezası: Esansiyel yağ	sensitivity	2026-04-02 23:56:52.033564	2026-04-02 23:56:52.033564
\.


--
-- Data for Name: sponsorship_disclosures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sponsorship_disclosures (disclosure_id, article_id, sponsor_name, disclosure_level, disclosure_text, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: supplement_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supplement_details (supplement_detail_id, product_id, form, serving_size, serving_unit, servings_per_container, recommended_use, warnings, requires_prescription, manufacturer_country, certification, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: supplement_ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supplement_ingredients (supplement_ingredient_id, product_id, ingredient_id, amount_per_serving, unit, daily_value_percentage, is_proprietary_blend, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: user_corrections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_corrections (correction_id, entity_type, entity_id, correction_text, reporter_email, status, admin_note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_skin_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_skin_profiles (profile_id, anonymous_id, skin_type, concerns, sensitivities, age_range, created_at, updated_at) FROM stdin;
1	demo-profile-1	oily	[1, 6, 9]	{"alcohol": false, "paraben": false, "fragrance": true, "essential_oils": false}	25-34	2026-04-02 23:56:52.071242	2026-04-02 23:56:52.071242
2	demo-profile-2	dry	[4, 5, 10]	{"alcohol": true, "paraben": false, "fragrance": false, "essential_oils": false}	35-44	2026-04-02 23:56:52.071242	2026-04-02 23:56:52.071242
3	demo-profile-3	combination	[2, 3, 7]	{"alcohol": false, "paraben": true, "fragrance": true, "essential_oils": false}	25-34	2026-04-02 23:56:52.071242	2026-04-02 23:56:52.071242
4	test-uuid-1234	combination	[1, 2, 5]	{"alcohol": false, "paraben": false, "fragrance": true, "essential_oils": false}	25-34	2026-04-03 00:22:49.9979	2026-04-03 00:22:49.9979
5	test-1	oily	[1, 2]	{}	\N	2026-04-03 00:58:43.061791	2026-04-03 00:58:43.061791
\.


--
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.webhooks (webhook_id, api_key_id, url, events, secret_hash, is_active, failed_count, last_triggered_at, created_at, updated_at) FROM stdin;
\.


--
-- Name: admin_roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_roles_role_id_seq', 5, true);


--
-- Name: admin_users_admin_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_users_admin_user_id_seq', 1, true);


--
-- Name: affiliate_links_affiliate_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.affiliate_links_affiliate_link_id_seq', 27, true);


--
-- Name: api_keys_api_key_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.api_keys_api_key_id_seq', 1, false);


--
-- Name: approved_wordings_wording_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.approved_wordings_wording_id_seq', 15, true);


--
-- Name: audit_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_log_id_seq', 1, false);


--
-- Name: batch_imports_import_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.batch_imports_import_id_seq', 1, false);


--
-- Name: brands_brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.brands_brand_id_seq', 13, true);


--
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 13, true);


--
-- Name: content_articles_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_articles_article_id_seq', 7, true);


--
-- Name: evidence_levels_evidence_level_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.evidence_levels_evidence_level_id_seq', 8, true);


--
-- Name: formula_revisions_revision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.formula_revisions_revision_id_seq', 1, false);


--
-- Name: ingredient_aliases_alias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredient_aliases_alias_id_seq', 19, true);


--
-- Name: ingredient_evidence_links_link_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredient_evidence_links_link_id_seq', 1, false);


--
-- Name: ingredient_interactions_interaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredient_interactions_interaction_id_seq', 6, true);


--
-- Name: ingredient_need_mappings_ingredient_need_mapping_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredient_need_mappings_ingredient_need_mapping_id_seq', 55, true);


--
-- Name: ingredient_related_articles_ingredient_related_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredient_related_articles_ingredient_related_article_id_seq', 16, true);


--
-- Name: ingredients_ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredients_ingredient_id_seq', 25, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 3, true);


--
-- Name: need_related_articles_need_related_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.need_related_articles_need_related_article_id_seq', 14, true);


--
-- Name: needs_need_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.needs_need_id_seq', 16, true);


--
-- Name: price_history_price_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.price_history_price_history_id_seq', 1, false);


--
-- Name: product_images_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_images_image_id_seq', 25, true);


--
-- Name: product_ingredients_product_ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_ingredients_product_ingredient_id_seq', 118, true);


--
-- Name: product_labels_product_label_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_labels_product_label_id_seq', 1, false);


--
-- Name: product_masters_master_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_masters_master_id_seq', 1, false);


--
-- Name: product_need_scores_product_need_score_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_need_scores_product_need_score_id_seq', 139, true);


--
-- Name: product_related_articles_product_related_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_related_articles_product_related_article_id_seq', 1, false);


--
-- Name: product_variants_variant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_variants_variant_id_seq', 1, false);


--
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_product_id_seq', 25, true);


--
-- Name: scoring_configs_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scoring_configs_config_id_seq', 8, true);


--
-- Name: sponsorship_disclosures_disclosure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sponsorship_disclosures_disclosure_id_seq', 1, false);


--
-- Name: supplement_details_supplement_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supplement_details_supplement_detail_id_seq', 1, false);


--
-- Name: supplement_ingredients_supplement_ingredient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supplement_ingredients_supplement_ingredient_id_seq', 1, false);


--
-- Name: user_corrections_correction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_corrections_correction_id_seq', 1, false);


--
-- Name: user_skin_profiles_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_skin_profiles_profile_id_seq', 5, true);


--
-- Name: webhooks_webhook_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.webhooks_webhook_id_seq', 1, false);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: admin_roles admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (role_id);


--
-- Name: admin_roles admin_roles_role_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_role_key_key UNIQUE (role_key);


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (admin_user_id);


--
-- Name: affiliate_links affiliate_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_links
    ADD CONSTRAINT affiliate_links_pkey PRIMARY KEY (affiliate_link_id);


--
-- Name: affiliate_links affiliate_links_product_id_platform_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_links
    ADD CONSTRAINT affiliate_links_product_id_platform_key UNIQUE (product_id, platform);


--
-- Name: api_keys api_keys_key_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_hash_key UNIQUE (key_hash);


--
-- Name: api_keys api_keys_key_prefix_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_prefix_key UNIQUE (key_prefix);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (api_key_id);


--
-- Name: approved_wordings approved_wordings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approved_wordings
    ADD CONSTRAINT approved_wordings_pkey PRIMARY KEY (wording_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id);


--
-- Name: batch_imports batch_imports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batch_imports
    ADD CONSTRAINT batch_imports_pkey PRIMARY KEY (import_id);


--
-- Name: brands brands_brand_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_brand_slug_key UNIQUE (brand_slug);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (brand_id);


--
-- Name: categories categories_category_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_category_slug_key UNIQUE (category_slug);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- Name: content_articles content_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_articles
    ADD CONSTRAINT content_articles_pkey PRIMARY KEY (article_id);


--
-- Name: content_articles content_articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_articles
    ADD CONSTRAINT content_articles_slug_key UNIQUE (slug);


--
-- Name: evidence_levels evidence_levels_level_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evidence_levels
    ADD CONSTRAINT evidence_levels_level_key_key UNIQUE (level_key);


--
-- Name: evidence_levels evidence_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evidence_levels
    ADD CONSTRAINT evidence_levels_pkey PRIMARY KEY (evidence_level_id);


--
-- Name: formula_revisions formula_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formula_revisions
    ADD CONSTRAINT formula_revisions_pkey PRIMARY KEY (revision_id);


--
-- Name: ingredient_aliases ingredient_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_aliases
    ADD CONSTRAINT ingredient_aliases_pkey PRIMARY KEY (alias_id);


--
-- Name: ingredient_evidence_links ingredient_evidence_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_evidence_links
    ADD CONSTRAINT ingredient_evidence_links_pkey PRIMARY KEY (link_id);


--
-- Name: ingredient_interactions ingredient_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_interactions
    ADD CONSTRAINT ingredient_interactions_pkey PRIMARY KEY (interaction_id);


--
-- Name: ingredient_need_mappings ingredient_need_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_need_mappings
    ADD CONSTRAINT ingredient_need_mappings_pkey PRIMARY KEY (ingredient_need_mapping_id);


--
-- Name: ingredient_related_articles ingredient_related_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_related_articles
    ADD CONSTRAINT ingredient_related_articles_pkey PRIMARY KEY (ingredient_related_article_id);


--
-- Name: ingredients ingredients_ingredient_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_ingredient_slug_key UNIQUE (ingredient_slug);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (ingredient_id);


--
-- Name: need_related_articles need_related_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need_related_articles
    ADD CONSTRAINT need_related_articles_pkey PRIMARY KEY (need_related_article_id);


--
-- Name: needs needs_need_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.needs
    ADD CONSTRAINT needs_need_slug_key UNIQUE (need_slug);


--
-- Name: needs needs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.needs
    ADD CONSTRAINT needs_pkey PRIMARY KEY (need_id);


--
-- Name: price_history price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_pkey PRIMARY KEY (price_history_id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (image_id);


--
-- Name: product_ingredients product_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_ingredients
    ADD CONSTRAINT product_ingredients_pkey PRIMARY KEY (product_ingredient_id);


--
-- Name: product_labels product_labels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_labels
    ADD CONSTRAINT product_labels_pkey PRIMARY KEY (product_label_id);


--
-- Name: product_labels product_labels_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_labels
    ADD CONSTRAINT product_labels_product_id_key UNIQUE (product_id);


--
-- Name: product_masters product_masters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_masters
    ADD CONSTRAINT product_masters_pkey PRIMARY KEY (master_id);


--
-- Name: product_need_scores product_need_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_need_scores
    ADD CONSTRAINT product_need_scores_pkey PRIMARY KEY (product_need_score_id);


--
-- Name: product_related_articles product_related_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_related_articles
    ADD CONSTRAINT product_related_articles_pkey PRIMARY KEY (product_related_article_id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (variant_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: products products_product_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_product_slug_key UNIQUE (product_slug);


--
-- Name: scoring_configs scoring_configs_config_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scoring_configs
    ADD CONSTRAINT scoring_configs_config_key_key UNIQUE (config_key);


--
-- Name: scoring_configs scoring_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scoring_configs
    ADD CONSTRAINT scoring_configs_pkey PRIMARY KEY (config_id);


--
-- Name: sponsorship_disclosures sponsorship_disclosures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsorship_disclosures
    ADD CONSTRAINT sponsorship_disclosures_pkey PRIMARY KEY (disclosure_id);


--
-- Name: supplement_details supplement_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_details
    ADD CONSTRAINT supplement_details_pkey PRIMARY KEY (supplement_detail_id);


--
-- Name: supplement_details supplement_details_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_details
    ADD CONSTRAINT supplement_details_product_id_key UNIQUE (product_id);


--
-- Name: supplement_ingredients supplement_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_ingredients
    ADD CONSTRAINT supplement_ingredients_pkey PRIMARY KEY (supplement_ingredient_id);


--
-- Name: user_corrections user_corrections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_corrections
    ADD CONSTRAINT user_corrections_pkey PRIMARY KEY (correction_id);


--
-- Name: user_skin_profiles user_skin_profiles_anonymous_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_skin_profiles
    ADD CONSTRAINT user_skin_profiles_anonymous_id_key UNIQUE (anonymous_id);


--
-- Name: user_skin_profiles user_skin_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_skin_profiles
    ADD CONSTRAINT user_skin_profiles_pkey PRIMARY KEY (profile_id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (webhook_id);


--
-- Name: idx_audit_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_content_articles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_articles_status ON public.content_articles USING btree (status);


--
-- Name: idx_content_articles_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_articles_type ON public.content_articles USING btree (content_type);


--
-- Name: idx_ingredient_aliases_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingredient_aliases_trgm ON public.ingredient_aliases USING gin (alias_name public.gin_trgm_ops);


--
-- Name: idx_ingredient_need_mappings_ingredient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingredient_need_mappings_ingredient ON public.ingredient_need_mappings USING btree (ingredient_id);


--
-- Name: idx_ingredient_need_mappings_need; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingredient_need_mappings_need ON public.ingredient_need_mappings USING btree (need_id);


--
-- Name: idx_ingredients_common_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingredients_common_trgm ON public.ingredients USING gin (common_name public.gin_trgm_ops);


--
-- Name: idx_ingredients_inci_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingredients_inci_trgm ON public.ingredients USING gin (inci_name public.gin_trgm_ops);


--
-- Name: idx_interactions_a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interactions_a ON public.ingredient_interactions USING btree (ingredient_a_id);


--
-- Name: idx_interactions_b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_interactions_b ON public.ingredient_interactions USING btree (ingredient_b_id);


--
-- Name: idx_needs_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_needs_name_trgm ON public.needs USING gin (need_name public.gin_trgm_ops);


--
-- Name: idx_price_history_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_price_history_date ON public.price_history USING btree (recorded_at DESC);


--
-- Name: idx_price_history_link; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_price_history_link ON public.price_history USING btree (affiliate_link_id);


--
-- Name: idx_product_ingredients_ingredient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_ingredients_ingredient ON public.product_ingredients USING btree (ingredient_id);


--
-- Name: idx_product_ingredients_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_ingredients_product ON public.product_ingredients USING btree (product_id);


--
-- Name: idx_product_need_scores_need; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_need_scores_need ON public.product_need_scores USING btree (need_id);


--
-- Name: idx_product_need_scores_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_need_scores_product ON public.product_need_scores USING btree (product_id);


--
-- Name: idx_products_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_brand ON public.products USING btree (brand_id);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Name: idx_products_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_name_trgm ON public.products USING gin (product_name public.gin_trgm_ops);


--
-- Name: idx_products_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_status ON public.products USING btree (status);


--
-- Name: idx_supplement_ingredients_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supplement_ingredients_product ON public.supplement_ingredients USING btree (product_id);


--
-- Name: idx_webhooks_api_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webhooks_api_key ON public.webhooks USING btree (api_key_id);


--
-- Name: admin_users admin_users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(role_id);


--
-- Name: affiliate_links affiliate_links_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.affiliate_links
    ADD CONSTRAINT affiliate_links_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.categories(category_id) ON DELETE SET NULL;


--
-- Name: formula_revisions formula_revisions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.formula_revisions
    ADD CONSTRAINT formula_revisions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: ingredient_aliases ingredient_aliases_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_aliases
    ADD CONSTRAINT ingredient_aliases_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE;


--
-- Name: ingredient_evidence_links ingredient_evidence_links_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_evidence_links
    ADD CONSTRAINT ingredient_evidence_links_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE;


--
-- Name: ingredient_interactions ingredient_interactions_ingredient_a_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_interactions
    ADD CONSTRAINT ingredient_interactions_ingredient_a_id_fkey FOREIGN KEY (ingredient_a_id) REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE;


--
-- Name: ingredient_interactions ingredient_interactions_ingredient_b_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_interactions
    ADD CONSTRAINT ingredient_interactions_ingredient_b_id_fkey FOREIGN KEY (ingredient_b_id) REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE;


--
-- Name: ingredient_need_mappings ingredient_need_mappings_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_need_mappings
    ADD CONSTRAINT ingredient_need_mappings_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE;


--
-- Name: ingredient_need_mappings ingredient_need_mappings_need_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_need_mappings
    ADD CONSTRAINT ingredient_need_mappings_need_id_fkey FOREIGN KEY (need_id) REFERENCES public.needs(need_id) ON DELETE CASCADE;


--
-- Name: ingredient_related_articles ingredient_related_articles_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_related_articles
    ADD CONSTRAINT ingredient_related_articles_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.content_articles(article_id) ON DELETE CASCADE;


--
-- Name: ingredient_related_articles ingredient_related_articles_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient_related_articles
    ADD CONSTRAINT ingredient_related_articles_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE;


--
-- Name: need_related_articles need_related_articles_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need_related_articles
    ADD CONSTRAINT need_related_articles_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.content_articles(article_id) ON DELETE CASCADE;


--
-- Name: need_related_articles need_related_articles_need_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.need_related_articles
    ADD CONSTRAINT need_related_articles_need_id_fkey FOREIGN KEY (need_id) REFERENCES public.needs(need_id) ON DELETE CASCADE;


--
-- Name: price_history price_history_affiliate_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_affiliate_link_id_fkey FOREIGN KEY (affiliate_link_id) REFERENCES public.affiliate_links(affiliate_link_id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_ingredients product_ingredients_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_ingredients
    ADD CONSTRAINT product_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(ingredient_id);


--
-- Name: product_ingredients product_ingredients_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_ingredients
    ADD CONSTRAINT product_ingredients_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_labels product_labels_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_labels
    ADD CONSTRAINT product_labels_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_masters product_masters_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_masters
    ADD CONSTRAINT product_masters_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id);


--
-- Name: product_masters product_masters_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_masters
    ADD CONSTRAINT product_masters_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id);


--
-- Name: product_need_scores product_need_scores_need_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_need_scores
    ADD CONSTRAINT product_need_scores_need_id_fkey FOREIGN KEY (need_id) REFERENCES public.needs(need_id) ON DELETE CASCADE;


--
-- Name: product_need_scores product_need_scores_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_need_scores
    ADD CONSTRAINT product_need_scores_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_related_articles product_related_articles_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_related_articles
    ADD CONSTRAINT product_related_articles_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.content_articles(article_id) ON DELETE CASCADE;


--
-- Name: product_related_articles product_related_articles_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_related_articles
    ADD CONSTRAINT product_related_articles_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: product_variants product_variants_master_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_master_id_fkey FOREIGN KEY (master_id) REFERENCES public.product_masters(master_id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id);


--
-- Name: products products_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id) ON DELETE SET NULL;


--
-- Name: sponsorship_disclosures sponsorship_disclosures_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsorship_disclosures
    ADD CONSTRAINT sponsorship_disclosures_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.content_articles(article_id) ON DELETE CASCADE;


--
-- Name: supplement_details supplement_details_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_details
    ADD CONSTRAINT supplement_details_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: supplement_ingredients supplement_ingredients_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_ingredients
    ADD CONSTRAINT supplement_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE;


--
-- Name: supplement_ingredients supplement_ingredients_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_ingredients
    ADD CONSTRAINT supplement_ingredients_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- Name: webhooks webhooks_api_key_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_api_key_id_fkey FOREIGN KEY (api_key_id) REFERENCES public.api_keys(api_key_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

