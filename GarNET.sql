--
-- PostgreSQL database dump
--

\restrict hROJkc9JImAP2x4CIvLUfTse99HWIwzOlSugeVJH3WywzVJvNWSexuw4gZIRE95

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

-- Started on 2025-12-10 15:08:03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 17376)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 17377)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17405)
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin (
    id integer NOT NULL,
    matricule_admin character varying(25) NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17410)
-- Name: admin_cooperative; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_cooperative (
    admin_id integer NOT NULL,
    cooperative_id integer NOT NULL
);


ALTER TABLE public.admin_cooperative OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17416)
-- Name: avis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avis (
    id integer NOT NULL,
    code_voyage_id integer,
    code_client_id integer NOT NULL,
    ref_avis character varying(25) NOT NULL,
    note double precision NOT NULL,
    commentaire text,
    date_avis timestamp(0) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.avis OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17415)
-- Name: avis_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.avis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.avis_id_seq OWNER TO postgres;

--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 222
-- Name: avis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.avis_id_seq OWNED BY public.avis.id;


--
-- TOC entry 225 (class 1259 OID 17425)
-- Name: chauffeur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chauffeur (
    id integer NOT NULL,
    code_chauffeur character varying(25) NOT NULL,
    nom character varying(50) NOT NULL,
    permis character varying(70) NOT NULL,
    date_expiration_permis date,
    disponibilite character varying(255) NOT NULL,
    affectation_actuelle character varying(100),
    telephone integer NOT NULL,
    cin character varying(12) NOT NULL,
    adress character varying(70),
    etat_visite_med boolean
);


ALTER TABLE public.chauffeur OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17424)
-- Name: chauffeur_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chauffeur_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chauffeur_id_seq OWNER TO postgres;

--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 224
-- Name: chauffeur_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chauffeur_id_seq OWNED BY public.chauffeur.id;


--
-- TOC entry 226 (class 1259 OID 17433)
-- Name: client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client (
    id integer NOT NULL,
    ref_responsable_id integer,
    ref_client character varying(25) NOT NULL,
    adresse character varying(100),
    moyenne_satisfaction double precision,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.client OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17439)
-- Name: cooperative; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cooperative (
    id integer NOT NULL,
    code_cooperative character varying(25) NOT NULL,
    nom character varying(50) NOT NULL,
    adresse character varying(100),
    contact character varying(100),
    statut character varying(255) NOT NULL,
    date_inscription timestamp(0) without time zone NOT NULL,
    logo character varying(100)
);


ALTER TABLE public.cooperative OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17438)
-- Name: cooperative_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cooperative_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cooperative_id_seq OWNER TO postgres;

--
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 227
-- Name: cooperative_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cooperative_id_seq OWNED BY public.cooperative.id;


--
-- TOC entry 229 (class 1259 OID 17447)
-- Name: doctrine_migration_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctrine_migration_versions (
    version character varying(191) NOT NULL,
    executed_at timestamp(0) without time zone,
    execution_time integer
);


ALTER TABLE public.doctrine_migration_versions OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17453)
-- Name: document; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document (
    id integer NOT NULL,
    code_voiture_id integer,
    code_document character varying(25) NOT NULL,
    type_document character varying(255) NOT NULL,
    date_expiration date NOT NULL,
    fichier character varying(100),
    etat character varying(255) NOT NULL
);


ALTER TABLE public.document OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17452)
-- Name: document_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.document_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_id_seq OWNER TO postgres;

--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 230
-- Name: document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.document_id_seq OWNED BY public.document.id;


--
-- TOC entry 233 (class 1259 OID 17462)
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    ref_utilisateur_id integer,
    ref_notification character varying(70) NOT NULL,
    type character varying(255) NOT NULL,
    contenu text NOT NULL,
    date_envoi timestamp(0) without time zone NOT NULL,
    statut character varying(255) NOT NULL,
    canal character varying(255) NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17461)
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_id_seq OWNER TO postgres;

--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 232
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- TOC entry 235 (class 1259 OID 17471)
-- Name: paiement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paiement (
    id integer NOT NULL,
    code_reservation_id integer NOT NULL,
    code_paiement character varying(25) NOT NULL,
    montant double precision NOT NULL,
    mode_paiement character varying(255) NOT NULL,
    date_paiement timestamp(0) without time zone NOT NULL,
    status character varying(255) NOT NULL,
    paiement_restant double precision,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.paiement OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17470)
-- Name: paiement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.paiement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paiement_id_seq OWNER TO postgres;

--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 234
-- Name: paiement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.paiement_id_seq OWNED BY public.paiement.id;


--
-- TOC entry 237 (class 1259 OID 17480)
-- Name: passager; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.passager (
    id integer NOT NULL,
    code_voyage_id integer NOT NULL,
    code_client_id integer,
    code_passager character varying(25) NOT NULL,
    nom character varying(40) NOT NULL,
    prenoms character varying(60) NOT NULL,
    date_naissance date,
    numero_cin integer,
    telephone integer NOT NULL,
    email character varying(60)
);


ALTER TABLE public.passager OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17479)
-- Name: passager_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.passager_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.passager_id_seq OWNER TO postgres;

--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 236
-- Name: passager_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.passager_id_seq OWNED BY public.passager.id;


--
-- TOC entry 217 (class 1259 OID 17390)
-- Name: place_voiture; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.place_voiture (
    id integer NOT NULL,
    voiture_id integer NOT NULL,
    numero character varying(10) NOT NULL,
    est_chauffeur boolean DEFAULT false NOT NULL,
    est_reserve boolean DEFAULT false NOT NULL
);


ALTER TABLE public.place_voiture OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 17389)
-- Name: place_voiture_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.place_voiture_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.place_voiture_id_seq OWNER TO postgres;

--
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 216
-- Name: place_voiture_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.place_voiture_id_seq OWNED BY public.place_voiture.id;


--
-- TOC entry 239 (class 1259 OID 17487)
-- Name: recu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recu (
    id integer NOT NULL,
    code_reservation_id integer NOT NULL,
    code_recu character varying(25) NOT NULL,
    date_emission timestamp(0) without time zone NOT NULL,
    qr_code character varying(50) NOT NULL,
    format character varying(25)
);


ALTER TABLE public.recu OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17486)
-- Name: recu_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recu_id_seq OWNER TO postgres;

--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 238
-- Name: recu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recu_id_seq OWNED BY public.recu.id;


--
-- TOC entry 241 (class 1259 OID 17494)
-- Name: reservation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation (
    id integer NOT NULL,
    code_trajet_id integer NOT NULL,
    code_voyage_id integer NOT NULL,
    code_client_id integer NOT NULL,
    code_responsable_id integer,
    code_reservation character varying(25) NOT NULL,
    date_reservation timestamp(0) without time zone NOT NULL,
    statut character varying(255) NOT NULL,
    nombre_places integer NOT NULL
);


ALTER TABLE public.reservation OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 17493)
-- Name: reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservation_id_seq OWNER TO postgres;

--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 240
-- Name: reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservation_id_seq OWNED BY public.reservation.id;


--
-- TOC entry 219 (class 1259 OID 17399)
-- Name: reservation_place; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_place (
    id integer NOT NULL,
    reservation_id integer NOT NULL,
    place_id integer NOT NULL
);


ALTER TABLE public.reservation_place OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 17398)
-- Name: reservation_place_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservation_place_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservation_place_id_seq OWNER TO postgres;

--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 218
-- Name: reservation_place_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservation_place_id_seq OWNED BY public.reservation_place.id;


--
-- TOC entry 242 (class 1259 OID 17500)
-- Name: responsable_cooperative; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.responsable_cooperative (
    id integer NOT NULL,
    code_cooperative_id integer NOT NULL,
    ref_responsable character varying(25) NOT NULL,
    nom_cooperative character varying(70) NOT NULL,
    adresse_cooperative character varying(100),
    statut_cooperative character varying(30) NOT NULL
);


ALTER TABLE public.responsable_cooperative OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 17506)
-- Name: station; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.station (
    id integer NOT NULL,
    code_cooperative_id integer NOT NULL,
    code_station character varying(25) NOT NULL,
    nom character varying(100) NOT NULL,
    localisation character varying(100) NOT NULL,
    capacite integer,
    responsable character varying(70) NOT NULL,
    statut character varying(255) NOT NULL,
    coordonnee integer NOT NULL
);


ALTER TABLE public.station OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 17505)
-- Name: station_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.station_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.station_id_seq OWNER TO postgres;

--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 243
-- Name: station_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.station_id_seq OWNED BY public.station.id;


--
-- TOC entry 245 (class 1259 OID 17514)
-- Name: station_trajet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.station_trajet (
    station_id integer NOT NULL,
    trajet_id integer NOT NULL
);


ALTER TABLE public.station_trajet OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 17520)
-- Name: trajet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trajet (
    id integer NOT NULL,
    code_trajet character varying(25) NOT NULL,
    station_depart character varying(50) NOT NULL,
    station_arrivee character varying(50) NOT NULL,
    distance double precision NOT NULL,
    status character varying(255) NOT NULL
);


ALTER TABLE public.trajet OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 17519)
-- Name: trajet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trajet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trajet_id_seq OWNER TO postgres;

--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 246
-- Name: trajet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trajet_id_seq OWNED BY public.trajet.id;


--
-- TOC entry 249 (class 1259 OID 17527)
-- Name: utilisateur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilisateur (
    id integer NOT NULL,
    ref_utilisateur character varying(25) NOT NULL,
    nom character varying(100) NOT NULL,
    prenoms character varying(70),
    email character varying(100),
    telephone text NOT NULL,
    statut_compte character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    date_creation_compte timestamp(0) without time zone NOT NULL,
    mot_de_passe character varying(255) NOT NULL,
    photo_identite text,
    type_utilisateur character varying(255) NOT NULL,
    dernier_acces timestamp(0) without time zone,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.utilisateur OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 17526)
-- Name: utilisateur_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utilisateur_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utilisateur_id_seq OWNER TO postgres;

--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 248
-- Name: utilisateur_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utilisateur_id_seq OWNED BY public.utilisateur.id;


--
-- TOC entry 251 (class 1259 OID 17536)
-- Name: voiture; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.voiture (
    id integer NOT NULL,
    code_station_id integer,
    code_cooperative_id integer NOT NULL,
    immatriculation character varying(20) NOT NULL,
    modele character varying(25) NOT NULL,
    capacite integer NOT NULL,
    disponibilite character varying(25) NOT NULL,
    etat_technique character varying(20) NOT NULL,
    nb_ranger integer NOT NULL,
    nb_place_par_ranger integer NOT NULL
);


ALTER TABLE public.voiture OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 17542)
-- Name: voiture_chauffeur; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.voiture_chauffeur (
    voiture_id integer NOT NULL,
    chauffeur_id integer NOT NULL
);


ALTER TABLE public.voiture_chauffeur OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 17535)
-- Name: voiture_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.voiture_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voiture_id_seq OWNER TO postgres;

--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 250
-- Name: voiture_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.voiture_id_seq OWNED BY public.voiture.id;


--
-- TOC entry 254 (class 1259 OID 17548)
-- Name: voyage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.voyage (
    id integer NOT NULL,
    code_trajet_id integer NOT NULL,
    code_cooperative_id integer NOT NULL,
    code_voiture_id integer NOT NULL,
    code_chauffeur_id integer NOT NULL,
    code_voyage character varying(25) NOT NULL,
    date_depart timestamp(0) without time zone NOT NULL,
    heure_depart timestamp(0) without time zone,
    prix double precision NOT NULL,
    status character varying(255) NOT NULL
);


ALTER TABLE public.voyage OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 17547)
-- Name: voyage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.voyage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voyage_id_seq OWNER TO postgres;

--
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 253
-- Name: voyage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.voyage_id_seq OWNED BY public.voyage.id;


--
-- TOC entry 4801 (class 2604 OID 17419)
-- Name: avis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avis ALTER COLUMN id SET DEFAULT nextval('public.avis_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 17428)
-- Name: chauffeur id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chauffeur ALTER COLUMN id SET DEFAULT nextval('public.chauffeur_id_seq'::regclass);


--
-- TOC entry 4803 (class 2604 OID 17442)
-- Name: cooperative id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cooperative ALTER COLUMN id SET DEFAULT nextval('public.cooperative_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 17456)
-- Name: document id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document ALTER COLUMN id SET DEFAULT nextval('public.document_id_seq'::regclass);


--
-- TOC entry 4805 (class 2604 OID 17465)
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 17474)
-- Name: paiement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiement ALTER COLUMN id SET DEFAULT nextval('public.paiement_id_seq'::regclass);


--
-- TOC entry 4807 (class 2604 OID 17483)
-- Name: passager id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passager ALTER COLUMN id SET DEFAULT nextval('public.passager_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 17393)
-- Name: place_voiture id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_voiture ALTER COLUMN id SET DEFAULT nextval('public.place_voiture_id_seq'::regclass);


--
-- TOC entry 4808 (class 2604 OID 17490)
-- Name: recu id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recu ALTER COLUMN id SET DEFAULT nextval('public.recu_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 17497)
-- Name: reservation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation ALTER COLUMN id SET DEFAULT nextval('public.reservation_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 17402)
-- Name: reservation_place id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_place ALTER COLUMN id SET DEFAULT nextval('public.reservation_place_id_seq'::regclass);


--
-- TOC entry 4810 (class 2604 OID 17509)
-- Name: station id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station ALTER COLUMN id SET DEFAULT nextval('public.station_id_seq'::regclass);


--
-- TOC entry 4811 (class 2604 OID 17523)
-- Name: trajet id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trajet ALTER COLUMN id SET DEFAULT nextval('public.trajet_id_seq'::regclass);


--
-- TOC entry 4812 (class 2604 OID 17530)
-- Name: utilisateur id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur ALTER COLUMN id SET DEFAULT nextval('public.utilisateur_id_seq'::regclass);


--
-- TOC entry 4813 (class 2604 OID 17539)
-- Name: voiture id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voiture ALTER COLUMN id SET DEFAULT nextval('public.voiture_id_seq'::regclass);


--
-- TOC entry 4814 (class 2604 OID 17551)
-- Name: voyage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voyage ALTER COLUMN id SET DEFAULT nextval('public.voyage_id_seq'::regclass);


--
-- TOC entry 5072 (class 0 OID 17377)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f19f6c7a-3351-4524-878e-f31a4d1315b9	21334817a1703f1b931097c4fcdc909077655d11c3901c34436c2a53aaae94cd	2025-10-29 15:16:53.909279+03	20251029121653_v2_gestion_places	\N	\N	2025-10-29 15:16:53.409575+03	1
\.


--
-- TOC entry 5077 (class 0 OID 17405)
-- Dependencies: 220
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin (id, matricule_admin, deleted_at) FROM stdin;
1	ADM-2025-001	\N
\.


--
-- TOC entry 5078 (class 0 OID 17410)
-- Dependencies: 221
-- Data for Name: admin_cooperative; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_cooperative (admin_id, cooperative_id) FROM stdin;
\.


--
-- TOC entry 5080 (class 0 OID 17416)
-- Dependencies: 223
-- Data for Name: avis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avis (id, code_voyage_id, code_client_id, ref_avis, note, commentaire, date_avis, deleted_at) FROM stdin;
1	5	9	AVIS-1763040042910	5	Le voyage était excellent, chauffeur prudent !	2025-11-13 13:20:43	\N
2	1	9	AVIS-1763103525688	5	Quel merveilleux voyages!	2025-11-14 06:58:46	\N
3	4	12	AVIS-1764080476991	3	Tsara	2025-11-25 14:21:17	\N
4	23	13	AVI_DEMO_001	5	Très bon voyage, départ à l heure et chauffeur très professionnel.	2025-11-20 10:00:00	\N
5	19	13	AVI_DEMO_002	4.5	Voyage confortable, bonne ambiance dans le bus.	2025-11-15 10:00:00	\N
6	16	9	AVI_DEMO_003	4	Service correct, quelques retards au départ.	2025-11-05 09:00:00	\N
7	17	12	AVI_DEMO_004	3.5	Voyage acceptable, mais la climatisation ne fonctionnait pas bien.	2025-11-06 09:00:00	\N
8	18	14	AVI_DEMO_005	4.2	Chauffeur prudent, trajet fluide et sans incident.	2025-11-10 09:00:00	\N
9	25	8	AVI_DEMO_006	3.8	Bon trajet dans l ensemble, un peu de bruit dans le bus.	2025-11-22 09:00:00	\N
10	28	2	AVI_DEMO_010	4.2	Trajet agréable, bus propre et personnel accueillant.	2025-11-03 12:00:00	\N
11	29	5	AVI_DEMO_011	3.8	Un peu de retard au départ mais bonne conduite du chauffeur.	2025-11-07 10:00:00	\N
12	30	8	AVI_DEMO_012	4.5	Voyage confortable, musique agréable pendant le trajet.	2025-11-04 11:00:00	\N
13	31	12	AVI_DEMO_013	3.6	Bon service mais pause un peu trop courte à mi-chemin.	2025-11-10 11:30:00	\N
14	32	4	AVI_DEMO_014	4.1	Trajet sans incident, climatisation correcte.	2025-11-05 10:30:00	\N
15	33	7	AVI_DEMO_015	4.7	Chauffeur très prudent, arrivée à l heure.	2025-11-11 11:00:00	\N
16	34	9	AVI_DEMO_016	3.9	Route un peu difficile mais le chauffeur gérait bien.	2025-11-06 10:00:00	\N
17	35	13	AVI_DEMO_017	4.3	Sièges confortables et bonne organisation des arrêts.	2025-11-12 09:30:00	\N
18	36	2	AVI_DEMO_018	4	Beau paysage sur la route, trajet agréable.	2025-11-07 12:00:00	\N
19	37	4	AVI_DEMO_019	3.5	Un peu de bruit dans le bus mais globalement correct.	2025-11-13 12:30:00	\N
20	38	5	AVI_DEMO_020	4.4	Service professionnel, temps de trajet raisonnable.	2025-11-08 11:30:00	\N
21	39	7	AVI_DEMO_021	3.7	Voyage correct, quelques secousses sur la route.	2025-11-14 11:45:00	\N
22	40	8	AVI_DEMO_022	4.6	Très bonne expérience, je recommande cette coopérative.	2025-11-09 10:30:00	\N
23	41	2	AVI_DEMO_023	3.9	Confort acceptable, petit retard à l arrivée.	2025-11-15 10:50:00	\N
24	42	4	AVI_DEMO_024	4.8	Très bon niveau de confort, personnel poli.	2025-11-10 09:00:00	\N
25	43	9	AVI_DEMO_025	4.5	Excellent service, bus moderne et bien entretenu.	2025-11-16 09:30:00	\N
\.


--
-- TOC entry 5082 (class 0 OID 17425)
-- Dependencies: 225
-- Data for Name: chauffeur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chauffeur (id, code_chauffeur, nom, permis, date_expiration_permis, disponibilite, affectation_actuelle, telephone, cin, adress, etat_visite_med) FROM stdin;
1	CH001	ANDRIAMIHAJA Jean	123456789MG	2027-12-31	disponible	\N	340111222	123456789012	Ambohimena	\N
2	CH002	ANDRIAMIHAJA Jean	987654321MG	2028-06-30	disponible	\N	340123456	101201234567	Ambohimena	\N
3	CH003	RASOANIRINA Paul	876543210MG	2027-12-15	disponible	\N	340987654	102302345678	Isorana	\N
4	CH004	RAKOTONDRABE Luc	765432109MG	2029-03-20	disponible	\N	340555666	103403456789	Avenue de France	\N
5	CH005	ANDRIANARIVELO Marc	654321098MG	2028-09-10	disponible	\N	340444777	104504567890	Boulevard Ratsimilaho	\N
6	CH006	RASOAMAHARO Feno	543210987MG	2027-11-05	disponible	\N	340333888	105605678901	Route de l'Aéroport	\N
7	CH007	ANDRIANJATO Tina	432109876MG	2029-01-25	disponible	\N	340222999	106706789012	Rue Rabezavana	\N
8	CH008	RAKOTOMALALA Solo	321098765MG	2028-07-12	disponible	\N	340111000	107807890123	Avenue de l'Indépendance	\N
9	CH009	ANDRIAMIHAJA Nina	210987654MG	2027-10-30	disponible	\N	340999111	108908901234	Rue Ravoninahitriniarivo	\N
10	CH010	RAKOTONDRASOA Zafy	109876543MG	2029-04-18	disponible	\N	340888222	109009012345	Route Nationale 6	\N
11	CH011	ANDRIANARISOA Voahangy	098765432MG	2028-08-22	disponible	\N	340777333	110110123456	Boulevard de la Liberté	\N
\.


--
-- TOC entry 5083 (class 0 OID 17433)
-- Dependencies: 226
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client (id, ref_responsable_id, ref_client, adresse, moyenne_satisfaction, deleted_at) FROM stdin;
2	3	CLI001	Andraisoro	\N	\N
4	\N	CLI1761747279178	\N	\N	\N
5	\N	CLI1761896384889	\N	\N	\N
7	\N	CLI1761897156047	\N	\N	\N
8	\N	CLI1761910489671	\N	\N	\N
9	\N	CLI1761917622936	\N	\N	\N
12	\N	CLI1762433320738	\N	\N	\N
13	\N	CLI1763380741112	\N	\N	\N
14	\N	CLI1763703354684	\N	\N	\N
\.


--
-- TOC entry 5085 (class 0 OID 17439)
-- Dependencies: 228
-- Data for Name: cooperative; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cooperative (id, code_cooperative, nom, adresse, contact, statut, date_inscription, logo) FROM stdin;
2	COOP002	COTRAMA	Lot IVK 23 Bis Analakely, Antananarivo	034 12 345 67	active	2025-11-07 16:56:57	cotrama.png
4	COOP004	SONATRA	Boulevard Ratsimandrava, Toliara	034 98 765 43	active	2025-11-07 16:56:57	sonatra.png
3	COOP003	Trans-Fi	Rue Ravoninahitriniarivo, Fianarantsoa	034 55 666 77	active	2025-11-07 16:56:57	trans_fi.png
5	COOP005	Cotisse Transport	Ambolokandrina, Antsiranana	034 11 222 33	active	2025-11-07 16:56:57	cotisse_transport.png
6	COOP006	FCE Trans	Mahamasina, Antananarivo	034 22 333 44	active	2025-11-07 16:56:57	fce_trans.png
7	COOP007	Trans Nord	Ambalavao, Mahajanga	034 44 555 66	active	2025-11-07 16:56:57	trans_nord.png
8	COOP008	Maki Trans	Route Circulaire, Toamasina	034 77 888 99	active	2025-11-07 16:56:57	maki_trans.png
9	COOP009	Sprinter Madagascar	Tanambao, Antsiranana	034 33 444 55	active	2025-11-07 16:56:57	sprinter_madagascar.png
10	COOP010	Coopérative VIP	Andraharo, Antananarivo	034 66 777 88	active	2025-11-07 16:56:57	cooperative_vip.png
1	COOP001	Trans-Antsiranana	Ambolokandrina	0341234567	active	2025-10-29 15:19:25	trans_antsiranana.png
\.


--
-- TOC entry 5086 (class 0 OID 17447)
-- Dependencies: 229
-- Data for Name: doctrine_migration_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctrine_migration_versions (version, executed_at, execution_time) FROM stdin;
\.


--
-- TOC entry 5088 (class 0 OID 17453)
-- Dependencies: 231
-- Data for Name: document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document (id, code_voiture_id, code_document, type_document, date_expiration, fichier, etat) FROM stdin;
\.


--
-- TOC entry 5090 (class 0 OID 17462)
-- Dependencies: 233
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, ref_utilisateur_id, ref_notification, type, contenu, date_envoi, statut, canal) FROM stdin;
1	1	NOTIF-1763533102941-710	reservation_confirmee	Votre réservation pour Antananarivo - Toamasina a été confirmée !	2025-11-19 06:18:23	non_lu	app
2	9	NOTIF-1763534308151-683	reservation_confirmee	Votre réservation pour Antananarivo - Toamasina a été confirmée !	2025-11-19 06:38:28	lu	app
3	13	NOTIF-mi7dpjrg-9bf71f0a	paiement_confirme	✅ Paiement confirmé ! Voyage Manakara → Fianarantsoa le 09/12/2025. Places : 19. Montant : 50000 Ar	2025-11-20 11:59:42	non_lu	app
6	12	NOTIF-mi7f6xuw-4c10e989	paiement_confirme	✅ Paiement confirmé ! Voyage Toliara → Antananarivo le 04/12/2025. Places : 18. Montant : 120000 Ar	2025-11-20 12:41:13	non_lu	app
7	14	NOTIF-mi8fnqhz-8c936ae7	paiement_confirme	✅ Paiement confirmé ! Voyage Ambanja → Antsiranana le 08/12/2025. Places : 15. Montant : 45000 Ar	2025-11-21 05:42:03	lu	app
8	13	NOTIF-mienwe8j-91a39b37	paiement_confirme	✅ Paiement confirmé ! Voyage Mahajanga → Antananarivo le 02/12/2025. Places : 8. Montant : 95000 Ar	2025-11-25 14:19:21	non_lu	app
9	13	NOTIF-mienxnix-b3c950d3	paiement_confirme	✅ Paiement confirmé ! Voyage Toamasina → Antananarivo le 03/12/2025. Places : 17, 16, 13, 14. Montant : 220000 Ar	2025-11-25 14:20:20	non_lu	app
4	13	NOTIF-mi7dzgyd-5cac403d	paiement_confirme	✅ Paiement confirmé ! Voyage Morondava → Toliara le 06/12/2025. Places : 21. Montant : 75000 Ar	2025-11-20 12:07:25	lu	app
5	13	NOTIF-mi7e8l41-3bbc44f6	paiement_confirme	✅ Paiement confirmé ! Voyage Fianarantsoa → Antananarivo le 01/12/2025. Places : 7. Montant : 65000 Ar	2025-11-20 12:14:31	lu	app
10	12	NOTIF-mizw5ngw-f44034fc	paiement_confirme	✅ Paiement confirmé ! Voyage Antsirabe → Fianarantsoa le 05/12/2025. Places : 11. Montant : 35000 Ar	2025-12-10 10:53:40	non_lu	app
\.


--
-- TOC entry 5092 (class 0 OID 17471)
-- Dependencies: 235
-- Data for Name: paiement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paiement (id, code_reservation_id, code_paiement, montant, mode_paiement, date_paiement, status, paiement_restant, deleted_at) FROM stdin;
1	1	PAY001	170000	MVola	2025-10-29 15:19:25	payé	\N	\N
2	10	PAY-mi7dpjkb-2fa36e93	50000	MVola	2025-11-20 11:59:42	valide	0	\N
3	11	PAY-mi7dzgy1-19568d70	75000	MVola	2025-11-20 12:07:25	valide	0	\N
4	12	PAY-mi7e8l3s-2e1ccc6b	65000	MVola	2025-11-20 12:14:31	valide	0	\N
5	13	PAY-mi7f6xpw-114e7030	120000	MVola	2025-11-20 12:41:13	valide	0	\N
6	14	PAY-mi8fnpz9-4293d232	45000	MVola	2025-11-21 05:42:03	valide	0	\N
7	15	PAY-mienwe1h-7c91faf7	95000	MVola	2025-11-25 14:19:21	valide	0	\N
8	16	PAY-mienxnih-e92d6732	220000	MVola	2025-11-25 14:20:20	valide	0	\N
9	17	PAY_DEMO_001	40000	MVola	2025-11-04 11:00:00	valide	0	\N
10	18	PAY_DEMO_002	42000	MVola	2025-11-09 11:00:00	valide	0	\N
11	19	PAY_DEMO_003	45000	MVola	2025-11-05 11:00:00	valide	0	\N
12	20	PAY_DEMO_010	45000	MVola	2025-10-25 11:00:00	valide	0	\N
13	21	PAY_DEMO_011	45000	MVola	2025-10-26 12:00:00	valide	0	\N
14	22	PAY_DEMO_012	30000	MVola	2025-10-30 10:00:00	valide	0	\N
15	23	PAY_DEMO_013	30000	MVola	2025-10-31 10:30:00	valide	0	\N
16	24	PAY_DEMO_014	50000	MVola	2025-10-28 11:00:00	valide	0	\N
17	25	PAY_DEMO_015	50000	MVola	2025-10-29 11:30:00	valide	0	\N
18	26	PAY_DEMO_016	80000	MVola	2025-11-01 11:30:00	valide	0	\N
19	27	PAY_DEMO_017	80000	MVola	2025-11-02 11:45:00	valide	0	\N
20	28	PAY_DEMO_018	55000	MVola	2025-10-29 09:00:00	valide	0	\N
21	29	PAY_DEMO_019	55000	MVola	2025-10-30 09:30:00	valide	0	\N
22	30	PAY_DEMO_020	60000	MVola	2025-11-03 10:00:00	valide	0	\N
23	31	PAY_DEMO_021	60000	MVola	2025-11-04 10:30:00	valide	0	\N
24	32	PAY_DEMO_022	45000	MVola	2025-10-30 08:00:00	valide	0	\N
25	33	PAY_DEMO_023	45000	MVola	2025-10-31 08:15:00	valide	0	\N
26	34	PAY_DEMO_024	30000	MVola	2025-11-05 06:30:00	valide	0	\N
27	35	PAY_DEMO_025	30000	MVola	2025-11-06 06:40:00	valide	0	\N
28	36	PAY_DEMO_026	70000	MVola	2025-10-31 09:00:00	valide	0	\N
29	37	PAY_DEMO_027	70000	MVola	2025-11-01 09:20:00	valide	0	\N
30	38	PAY_DEMO_028	40000	MVola	2025-11-07 10:10:00	valide	0	\N
31	39	PAY_DEMO_029	40000	MVola	2025-11-08 10:20:00	valide	0	\N
32	40	PAY_DEMO_030	55000	MVola	2025-10-31 09:00:00	valide	0	\N
33	41	PAY_DEMO_031	55000	MVola	2025-11-01 09:30:00	valide	0	\N
34	42	PAY_DEMO_032	60000	MVola	2025-11-08 10:00:00	valide	0	\N
35	43	PAY_DEMO_033	60000	MVola	2025-11-09 10:30:00	valide	0	\N
36	44	PAY_DEMO_034	55000	MVola	2025-11-01 09:10:00	valide	0	\N
37	45	PAY_DEMO_035	55000	MVola	2025-11-02 09:40:00	valide	0	\N
38	46	PAY_DEMO_036	60000	MVola	2025-11-09 10:10:00	valide	0	\N
39	47	PAY_DEMO_037	60000	MVola	2025-11-10 10:40:00	valide	0	\N
40	48	PAY_DEMO_038	60000	MVola	2025-11-02 08:30:00	valide	0	\N
41	49	PAY_DEMO_039	60000	MVola	2025-11-03 08:45:00	valide	0	\N
42	50	PAY_DEMO_040	90000	MVola	2025-11-10 08:50:00	valide	0	\N
43	51	PAY_DEMO_041	90000	MVola	2025-11-11 09:10:00	valide	0	\N
44	52	PAY-mizw5n03-aaaa9c66	35000	MVola	2025-12-10 10:53:39	valide	0	\N
\.


--
-- TOC entry 5094 (class 0 OID 17480)
-- Dependencies: 237
-- Data for Name: passager; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.passager (id, code_voyage_id, code_client_id, code_passager, nom, prenoms, date_naissance, numero_cin, telephone, email) FROM stdin;
1	4	12	PASS-mhvrsmdi-adbfc7f1	Mirado	Franck	\N	\N	326599744	mirado@gmail.com
2	15	13	PASS-mi7donet-ff2c26cd	Mirado	Franck	\N	\N	383096154	exemple@gmail.com
3	12	13	PASS-mi7dysml-54d8c695	Mirado	Franck	\N	\N	383096154	exemple@gmail.com
4	7	13	PASS-mi7e86j4-510e0957	Mirado	Franck	\N	\N	383096154	exemple@gmail.com
5	10	12	PASS-mi7f6l6z-2edb5ae8	Mirado	Franck	\N	\N	326599744	mirado@gmail.com
6	14	14	PASS-mi8fn7wc-17e33e67	Morainy	Henri	\N	\N	340000001	henri@gmail.com
7	8	13	PASS-mienw01m-3958531c	Mirado	Franck	\N	\N	383096154	exemple@gmail.com
8	9	13	PASS-mienx1oq-2af8d5e8	Mirado	Franck	\N	\N	383096154	exemple@gmail.com
9	9	13	PASS-mienx1oq-f11f1c42	Mirado	Franck	\N	\N	383096154	exemple@gmail.com
10	9	13	PASS-mienx1oq-65c3955c	Mirado	Franck	\N	\N	383096154	exemple@gmail.com
11	9	13	PASS-mienx1oq-163e370b	Mirado	Franck	\N	\N	383096154	exemple@gmail.com
12	11	12	PASS-mizw4y3s-f013383d	Mirado	Franck	\N	\N	326599744	mirado@gmail.com
13	15	14	PASS-mizwz5rt-3b7c1e49	Morainy	Henri	\N	\N	340000001	henri@gmail.com
\.


--
-- TOC entry 5074 (class 0 OID 17390)
-- Dependencies: 217
-- Data for Name: place_voiture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.place_voiture (id, voiture_id, numero, est_chauffeur, est_reserve) FROM stdin;
1	1	0	t	t
2	1	1	f	t
3	1	2	f	t
20	1	19	f	t
22	1	21	f	t
8	1	7	f	t
19	1	18	f	t
16	1	15	f	t
5	1	4	f	f
9	1	8	f	t
6	1	5	f	f
14	1	13	f	t
17	1	16	f	t
4	1	3	f	t
10	1	9	f	t
13	1	12	f	t
7	1	6	f	t
23	1	22	f	t
21	1	20	f	t
264	2	0	t	t
265	2	1	f	f
266	2	2	f	f
267	2	3	f	f
268	2	4	f	f
269	2	5	f	f
270	2	6	f	f
271	2	7	f	f
272	2	8	f	f
273	2	9	f	f
274	2	10	f	f
275	2	11	f	f
276	2	12	f	f
277	2	13	f	f
278	2	14	f	f
279	2	15	f	f
280	2	16	f	f
281	2	17	f	f
282	2	18	f	f
283	2	19	f	f
284	2	20	f	f
285	2	21	f	f
286	2	22	f	f
287	2	23	f	f
288	3	0	t	t
289	3	1	f	f
290	3	2	f	f
291	3	3	f	f
292	3	4	f	f
293	3	5	f	f
294	3	6	f	f
295	3	7	f	f
296	3	8	f	f
297	3	9	f	f
298	3	10	f	f
299	3	11	f	f
300	3	12	f	f
301	3	13	f	f
302	3	14	f	f
303	3	15	f	f
304	3	16	f	f
305	3	17	f	f
306	3	18	f	f
307	3	19	f	f
308	3	20	f	f
309	3	21	f	f
310	3	22	f	f
311	3	23	f	f
312	4	0	t	t
313	4	1	f	f
314	4	2	f	f
315	4	3	f	f
316	4	4	f	f
317	4	5	f	f
318	4	6	f	f
319	4	7	f	f
320	4	8	f	f
321	4	9	f	f
322	4	10	f	f
323	4	11	f	f
324	4	12	f	f
325	4	13	f	f
326	4	14	f	f
327	4	15	f	f
328	4	16	f	f
329	4	17	f	f
330	4	18	f	f
331	4	19	f	f
332	4	20	f	f
333	4	21	f	f
334	4	22	f	f
335	4	23	f	f
336	5	0	t	t
337	5	1	f	f
338	5	2	f	f
339	5	3	f	f
340	5	4	f	f
341	5	5	f	f
342	5	6	f	f
343	5	7	f	f
344	5	8	f	f
345	5	9	f	f
346	5	10	f	f
347	5	11	f	f
348	5	12	f	f
349	5	13	f	f
350	5	14	f	f
351	5	15	f	f
352	5	16	f	f
353	5	17	f	f
354	5	18	f	f
355	5	19	f	f
356	5	20	f	f
357	5	21	f	f
358	5	22	f	f
359	5	23	f	f
360	6	0	t	t
361	6	1	f	f
362	6	2	f	f
363	6	3	f	f
364	6	4	f	f
365	6	5	f	f
366	6	6	f	f
367	6	7	f	f
368	6	8	f	f
369	6	9	f	f
370	6	10	f	f
371	6	11	f	f
372	6	12	f	f
373	6	13	f	f
374	6	14	f	f
375	6	15	f	f
376	6	16	f	f
377	6	17	f	f
378	6	18	f	f
379	6	19	f	f
380	6	20	f	f
381	6	21	f	f
382	6	22	f	f
383	6	23	f	f
384	7	0	t	t
385	7	1	f	f
386	7	2	f	f
387	7	3	f	f
388	7	4	f	f
389	7	5	f	f
390	7	6	f	f
391	7	7	f	f
392	7	8	f	f
393	7	9	f	f
394	7	10	f	f
395	7	11	f	f
396	7	12	f	f
397	7	13	f	f
398	7	14	f	f
399	7	15	f	f
400	7	16	f	f
401	7	17	f	f
402	7	18	f	f
403	7	19	f	f
404	7	20	f	f
18	1	17	f	t
15	1	14	f	t
12	1	11	f	t
11	1	10	f	t
405	7	21	f	f
406	7	22	f	f
407	7	23	f	f
408	8	0	t	t
409	8	1	f	f
410	8	2	f	f
411	8	3	f	f
412	8	4	f	f
413	8	5	f	f
414	8	6	f	f
415	8	7	f	f
416	8	8	f	f
417	8	9	f	f
418	8	10	f	f
419	8	11	f	f
420	8	12	f	f
421	8	13	f	f
422	8	14	f	f
423	8	15	f	f
424	8	16	f	f
425	8	17	f	f
426	8	18	f	f
427	8	19	f	f
428	8	20	f	f
429	8	21	f	f
430	8	22	f	f
431	8	23	f	f
432	9	0	t	t
433	9	1	f	f
434	9	2	f	f
435	9	3	f	f
436	9	4	f	f
437	9	5	f	f
438	9	6	f	f
439	9	7	f	f
440	9	8	f	f
441	9	9	f	f
442	9	10	f	f
443	9	11	f	f
444	9	12	f	f
445	9	13	f	f
446	9	14	f	f
447	9	15	f	f
448	9	16	f	f
449	9	17	f	f
450	9	18	f	f
451	9	19	f	f
452	9	20	f	f
453	9	21	f	f
454	9	22	f	f
455	9	23	f	f
456	10	0	t	t
457	10	1	f	f
458	10	2	f	f
459	10	3	f	f
460	10	4	f	f
461	10	5	f	f
462	10	6	f	f
463	10	7	f	f
464	10	8	f	f
465	10	9	f	f
466	10	10	f	f
467	10	11	f	f
468	10	12	f	f
469	10	13	f	f
470	10	14	f	f
471	10	15	f	f
472	10	16	f	f
473	10	17	f	f
474	10	18	f	f
475	10	19	f	f
476	10	20	f	f
477	10	21	f	f
478	10	22	f	f
479	10	23	f	f
480	11	0	t	t
481	11	1	f	f
482	11	2	f	f
483	11	3	f	f
484	11	4	f	f
485	11	5	f	f
486	11	6	f	f
487	11	7	f	f
488	11	8	f	f
489	11	9	f	f
490	11	10	f	f
491	11	11	f	f
492	11	12	f	f
493	11	13	f	f
494	11	14	f	f
495	11	15	f	f
496	11	16	f	f
497	11	17	f	f
498	11	18	f	f
499	11	19	f	f
500	11	20	f	f
501	11	21	f	f
502	11	22	f	f
503	11	23	f	f
\.


--
-- TOC entry 5096 (class 0 OID 17487)
-- Dependencies: 239
-- Data for Name: recu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recu (id, code_reservation_id, code_recu, date_emission, qr_code, format) FROM stdin;
1	1	RECU001	2025-10-29 15:19:25	QR-RES001	A4
2	10	RECU-mi7dpjmb-664adc93	2025-11-20 11:59:42	GARENET-RES-mi7donlv-5d131865-VOY025	PDF
3	11	RECU-mi7dzgy7-ee1880e6	2025-11-20 12:07:25	GARENET-RES-mi7dysn0-eb0307de-VOY022	PDF
4	12	RECU-mi7e8l3x-323077a0	2025-11-20 12:14:31	GARENET-RES-mi7e86j9-594b9404-VOY017	PDF
5	13	RECU-mi7f6xq2-8eccaa7b	2025-11-20 12:41:13	GARENET-RES-mi7f6lac-73db07fc-VOY020	PDF
6	14	RECU-mi8fnqal-46d1dfe1	2025-11-21 05:42:03	GARENET-RES-mi8fn82l-70ba9502-VOY024	PDF
7	15	RECU-mienwe2t-d06fa244	2025-11-25 14:19:21	GARENET-RES-mienw0g8-88743090-VOY018	PDF
8	16	RECU-mienxnit-592a4aaa	2025-11-25 14:20:20	GARENET-RES-mienx1ov-136e48dc-VOY019	PDF
9	52	RECU-mizw5nb7-1e73ce5c	2025-12-10 10:53:40	GARENET-RES-mizw4ykw-e0ec4a9e-VOY021	PDF
\.


--
-- TOC entry 5098 (class 0 OID 17494)
-- Dependencies: 241
-- Data for Name: reservation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservation (id, code_trajet_id, code_voyage_id, code_client_id, code_responsable_id, code_reservation, date_reservation, statut, nombre_places) FROM stdin;
2	1	1	9	\N	RES1762343083512171	2025-11-05 11:44:44	confirmee	3
3	2	5	9	\N	RES1762432740041169	2025-11-06 12:39:01	confirmee	1
4	2	5	12	\N	RES1762433979205688	2025-11-06 12:59:39	confirmee	1
5	2	5	9	\N	RES1762493417725704	2025-11-07 05:30:18	annulee	1
6	2	2	9	\N	RES1762845732409198	2025-11-11 07:22:13	annulee	2
9	2	4	12	\N	RES-mhvrsml8-27d507f2	2025-11-12 09:00:47	confirmee	1
1	1	1	2	\N	RES001	2025-10-29 15:19:25	confirmee	2
10	10	15	13	\N	RES-mi7donlv-5d131865	2025-11-20 11:59:01	confirmee	1
11	7	12	13	\N	RES-mi7dysn0-eb0307de	2025-11-20 12:06:54	confirmee	1
12	2	7	13	\N	RES-mi7e86j9-594b9404	2025-11-20 12:14:12	confirmee	1
13	5	10	12	\N	RES-mi7f6lac-73db07fc	2025-11-20 12:40:57	confirmee	1
14	9	14	14	\N	RES-mi8fn82l-70ba9502	2025-11-21 05:41:39	confirmee	1
15	3	8	13	\N	RES-mienw0g8-88743090	2025-11-25 14:19:03	confirmee	1
16	4	9	13	\N	RES-mienx1ov-136e48dc	2025-11-25 14:19:52	confirmee	4
17	2	23	13	\N	RES_DEMO_001	2025-11-04 10:00:00	confirmee	1
18	2	24	13	\N	RES_DEMO_002	2025-11-09 10:00:00	confirmee	1
19	2	19	13	\N	RES_DEMO_003	2025-11-05 10:00:00	confirmee	1
20	2	28	2	\N	RES_DEMO_010	2025-10-25 09:00:00	confirmee	1
21	2	28	4	\N	RES_DEMO_011	2025-10-26 10:00:00	confirmee	1
22	10	29	5	\N	RES_DEMO_012	2025-10-30 08:00:00	confirmee	1
23	10	29	7	\N	RES_DEMO_013	2025-10-31 08:30:00	confirmee	1
24	4	30	8	\N	RES_DEMO_014	2025-10-28 09:00:00	confirmee	1
25	4	30	9	\N	RES_DEMO_015	2025-10-29 09:30:00	confirmee	1
26	5	31	12	\N	RES_DEMO_016	2025-11-01 10:00:00	confirmee	1
27	5	31	14	\N	RES_DEMO_017	2025-11-02 10:30:00	confirmee	1
28	3	32	4	\N	RES_DEMO_018	2025-10-29 08:00:00	confirmee	1
29	3	32	5	\N	RES_DEMO_019	2025-10-30 08:30:00	confirmee	1
30	4	33	7	\N	RES_DEMO_020	2025-11-03 09:00:00	confirmee	1
31	4	33	8	\N	RES_DEMO_021	2025-11-04 09:30:00	confirmee	1
32	2	34	9	\N	RES_DEMO_022	2025-10-30 07:30:00	confirmee	1
33	2	34	12	\N	RES_DEMO_023	2025-10-31 07:45:00	confirmee	1
34	10	35	13	\N	RES_DEMO_024	2025-11-05 06:10:00	confirmee	1
35	10	35	14	\N	RES_DEMO_025	2025-11-06 06:20:00	confirmee	1
36	8	36	2	\N	RES_DEMO_026	2025-10-31 08:10:00	confirmee	1
37	8	36	8	\N	RES_DEMO_027	2025-11-01 08:20:00	confirmee	1
38	9	37	4	\N	RES_DEMO_028	2025-11-07 09:00:00	confirmee	1
39	9	37	9	\N	RES_DEMO_029	2025-11-08 09:15:00	confirmee	1
40	3	38	5	\N	RES_DEMO_030	2025-10-31 08:00:00	confirmee	1
41	3	38	12	\N	RES_DEMO_031	2025-11-01 08:20:00	confirmee	1
42	7	39	7	\N	RES_DEMO_032	2025-11-08 09:00:00	confirmee	1
43	7	39	13	\N	RES_DEMO_033	2025-11-09 09:30:00	confirmee	1
44	3	40	8	\N	RES_DEMO_034	2025-11-01 08:10:00	confirmee	1
45	3	40	14	\N	RES_DEMO_035	2025-11-02 08:30:00	confirmee	1
46	4	41	2	\N	RES_DEMO_036	2025-11-09 09:00:00	confirmee	1
47	4	41	5	\N	RES_DEMO_037	2025-11-10 09:30:00	confirmee	1
48	2	42	4	\N	RES_DEMO_038	2025-11-02 07:30:00	confirmee	1
49	2	42	7	\N	RES_DEMO_039	2025-11-03 08:00:00	confirmee	1
50	3	43	9	\N	RES_DEMO_040	2025-11-10 07:40:00	confirmee	1
51	3	43	12	\N	RES_DEMO_041	2025-11-11 08:00:00	confirmee	1
52	6	11	12	\N	RES-mizw4ykw-e0ec4a9e	2025-12-10 10:53:07	confirmee	1
53	10	15	14	\N	RES-mizwz5rw-628f16cc	2025-12-10 11:16:36	en attente	1
\.


--
-- TOC entry 5076 (class 0 OID 17399)
-- Dependencies: 219
-- Data for Name: reservation_place; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservation_place (id, reservation_id, place_id) FROM stdin;
1	1	2
2	1	3
3	2	4
4	2	10
5	2	13
6	3	7
7	4	23
8	5	15
9	6	20
10	6	21
13	9	21
14	10	20
15	11	22
16	12	8
17	13	19
18	14	16
19	15	9
20	16	18
21	16	17
22	16	14
23	16	15
24	52	12
25	53	11
\.


--
-- TOC entry 5099 (class 0 OID 17500)
-- Dependencies: 242
-- Data for Name: responsable_cooperative; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.responsable_cooperative (id, code_cooperative_id, ref_responsable, nom_cooperative, adresse_cooperative, statut_cooperative) FROM stdin;
3	1	RES001	Trans-Antsiranana	Ambolokandrina	active
\.


--
-- TOC entry 5101 (class 0 OID 17506)
-- Dependencies: 244
-- Data for Name: station; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.station (id, code_cooperative_id, code_station, nom, localisation, capacite, responsable, statut, coordonnee) FROM stdin;
1	1	STA001	Gare Nord	Ambolokandrina	50	ANDRIANARIVELO	ouvert	123456
2	1	STA002	Gare Nord	Ambolokandrina, Antananarivo	50	RAKOTO Jean	ouvert	123456
3	2	STA003	Gare Fianarantsoa	Isorana, Fianarantsoa	40	RASOA Marie	ouvert	234567
4	3	STA004	Gare Mahajanga	Avenue de France, Mahajanga	45	ANDRIA Paul	ouvert	345678
5	4	STA005	Gare Toamasina	Boulevard Ratsimilaho, Toamasina	60	FENO Luc	ouvert	456789
6	5	STA006	Gare Toliara	Route de l'Aéroport, Toliara	35	LALA Jeanne	ouvert	567890
7	6	STA007	Gare Antsirabe	Rue Rabezavana, Antsirabe	40	TINA Robert	ouvert	678901
8	7	STA008	Gare Morondava	Avenue de l'Indépendance, Morondava	30	SOLO Michel	ouvert	789012
9	8	STA009	Gare Antsiranana	Rue Ravoninahitriniarivo, Antsiranana	50	NINA Claude	ouvert	890123
10	9	STA010	Gare Ambanja	Route Nationale 6, Ambanja	25	ZAFY Elise	ouvert	901234
11	10	STA011	Gare Manakara	Boulevard de la Liberté, Manakara	30	VOAHANGY Eric	ouvert	123789
\.


--
-- TOC entry 5102 (class 0 OID 17514)
-- Dependencies: 245
-- Data for Name: station_trajet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.station_trajet (station_id, trajet_id) FROM stdin;
\.


--
-- TOC entry 5104 (class 0 OID 17520)
-- Dependencies: 247
-- Data for Name: trajet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trajet (id, code_trajet, station_depart, station_arrivee, distance, status) FROM stdin;
1	TRA001	Gare Nord	Gare Sud	850.5	actif
2	TRA002	Fianarantsoa	Antananarivo	410.5	actif
3	TRA003	Mahajanga	Antananarivo	570	actif
4	TRA004	Toamasina	Antananarivo	365	actif
5	TRA005	Toliara	Antananarivo	950	actif
6	TRA006	Antsirabe	Fianarantsoa	170	actif
7	TRA007	Morondava	Toliara	480	actif
8	TRA008	Antsiranana	Mahajanga	780	actif
9	TRA009	Ambanja	Antsiranana	220	actif
10	TRA010	Manakara	Fianarantsoa	290	actif
\.


--
-- TOC entry 5106 (class 0 OID 17527)
-- Dependencies: 249
-- Data for Name: utilisateur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utilisateur (id, ref_utilisateur, nom, prenoms, email, telephone, statut_compte, role, date_creation_compte, mot_de_passe, photo_identite, type_utilisateur, dernier_acces, deleted_at) FROM stdin;
1	ADM001	RAKOTO	Jean	jean@transco.mg	340123456	actif	admin	2025-10-29 15:19:25	pass123	\N	admin	\N	\N
2	CLI001	RANDRIA	Marie	marie@gmail.com	340987654	actif	client	2025-10-29 15:19:25	pass123	\N	client	\N	\N
3	RES001	RASOANAIVO	Paul	paul@coop.mg	340555666	actif	responsable	2025-10-29 15:19:25	pass123	\N	responsable	\N	\N
4	USER176174727803050	Andria	Luc	luc.andria@example.com	0345556667	actif	client	2025-10-29 14:14:38	client2025	\N	standard	\N	\N
5	USER176189638452936	Mirado	Franck	miradorajosivelo@gmail.com	0383096132	actif	client	2025-10-31 07:39:45	123456	\N	standard	\N	\N
7	USER176189715553788	Henri	Morainy	morainyhenri@gmail.com	0369746564	actif	client	2025-10-31 07:52:36	12345678	\N	standard	\N	\N
8	USER176191048963316	Phely	Manambisoa	franckmirado14@gmail.com	0359841365	actif	client	2025-10-31 11:34:50	$2b$10$X6vYILJ1WKHiDFlkwvH8u.jaq6sGuur4Nt95gk75YTndkBlVnl7e2	\N	standard	\N	\N
9	USER176191762280922	Rakotomanana	Jean Paul	rakotomanana@gmail.com	0344598932	actif	client	2025-10-31 13:33:43	$2b$10$tNVO5IIs92G4BuvgHSXRoOEhLX6wNLt41NmfPOOk0thmPOraLPmnO	\N	standard	2025-12-04 08:44:29	\N
13	USER17633807410289	Mirado	Franck	exemple@gmail.com	0383096154	actif	client	2025-11-17 11:59:01	$2b$10$DIk94PTAzmIX822bHSnOJOUvYqtJ1ILxjKQU5BkJWgsZLer0ZIt9u	/uploads/photos/user-1763380740247-553846912.jpeg	standard	2025-12-10 10:19:31	\N
12	USER176243332030480	Mirado	Franck	mirado@gmail.com	0326599744	actif	client	2025-11-06 12:48:40	$2b$10$WpMvr/E.wjPxpeWjeWJVkeVr6FOgG0toDEi4.kREJ.iHaLUtKbsd2	/uploads/photos/user-1763970270525-840909756.jpeg	standard	2025-12-10 11:05:42	\N
14	USER17637033546467	Morainy	Henri	henri@gmail.com	0340000001	actif	client	2025-11-21 05:35:55	$2b$10$N3KrpJEFNGNCK58ItAjcGOniK2u0t7VdclfuJUIuvrNHk.wNzNrOu	/uploads/photos/user-1763703353363-782865948.jpeg	standard	2025-12-10 11:44:08	\N
\.


--
-- TOC entry 5108 (class 0 OID 17536)
-- Dependencies: 251
-- Data for Name: voiture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.voiture (id, code_station_id, code_cooperative_id, immatriculation, modele, capacite, disponibilite, etat_technique, nb_ranger, nb_place_par_ranger) FROM stdin;
1	\N	1	1234 TAD	Sprinter 23	23	disponible	bon	5	4
2	2	1	5678 TAD	Sprinter 23	23	disponible	bon	5	4
3	3	2	9012 FIA	Coaster 23	23	disponible	bon	5	4
4	4	3	3456 MAH	Sprinter 23	23	disponible	bon	5	4
5	5	4	7890 TOA	Hiace 23	23	disponible	bon	5	4
6	6	5	1234 TOL	Coaster 23	23	disponible	bon	5	4
7	7	6	4567 ANT	Sprinter 23	23	disponible	bon	5	4
8	8	7	8901 MOR	Hiace 23	23	disponible	bon	5	4
9	9	8	2345 DIE	Coaster 23	23	disponible	bon	5	4
10	10	9	6789 AMB	Sprinter 23	23	disponible	bon	5	4
11	11	10	0123 MAN	Hiace 23	23	disponible	bon	5	4
\.


--
-- TOC entry 5109 (class 0 OID 17542)
-- Dependencies: 252
-- Data for Name: voiture_chauffeur; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.voiture_chauffeur (voiture_id, chauffeur_id) FROM stdin;
\.


--
-- TOC entry 5111 (class 0 OID 17548)
-- Dependencies: 254
-- Data for Name: voyage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.voyage (id, code_trajet_id, code_cooperative_id, code_voiture_id, code_chauffeur_id, code_voyage, date_depart, heure_depart, prix, status) FROM stdin;
1	1	1	1	1	VOY001	2025-11-05 00:00:00	2025-11-05 06:00:00	85000	terminé
2	2	1	1	1	VOY002	2025-11-10 00:00:00	2025-11-10 07:00:00	65000	terminé
3	2	1	1	1	VOY003	2025-11-12 00:00:00	2025-11-12 08:30:00	65000	terminé
4	2	1	1	1	VOY004	2025-11-15 00:00:00	2025-11-15 06:00:00	68000	terminé
5	2	1	1	1	VOY005	2025-11-18 00:00:00	2025-11-18 14:00:00	70000	terminé
6	1	1	1	1	VOY016	2025-11-30 00:00:00	2025-11-30 06:00:00	85000	disponible
7	2	2	1	1	VOY017	2025-12-01 00:00:00	2025-12-01 07:30:00	65000	disponible
8	3	3	1	1	VOY018	2025-12-02 00:00:00	2025-12-02 05:45:00	95000	disponible
9	4	4	1	1	VOY019	2025-12-03 00:00:00	2025-12-03 08:00:00	55000	disponible
10	5	5	1	1	VOY020	2025-12-04 00:00:00	2025-12-04 06:30:00	120000	disponible
11	6	6	1	1	VOY021	2025-12-05 00:00:00	2025-12-05 09:00:00	35000	disponible
12	7	7	1	1	VOY022	2025-12-06 00:00:00	2025-12-06 07:00:00	75000	disponible
13	8	8	1	1	VOY023	2025-12-07 00:00:00	2025-12-07 05:30:00	110000	disponible
14	9	9	1	1	VOY024	2025-12-08 00:00:00	2025-12-08 10:00:00	45000	disponible
15	10	10	1	1	VOY025	2025-12-09 00:00:00	2025-12-09 08:30:00	50000	disponible
16	8	1	1	1	VOY026	2025-11-01 08:00:00	2025-11-01 08:00:00	60000	terminé
17	9	1	1	2	VOY027	2025-11-03 08:00:00	2025-11-03 08:00:00	55000	terminé
18	1	1	1	1	VOY028	2025-11-07 08:00:00	2025-11-07 08:00:00	20000	terminé
19	2	1	1	2	VOY029	2025-11-09 08:00:00	2025-11-09 08:00:00	45000	terminé
20	2	1	1	1	VOY030	2025-12-15 08:00:00	2025-12-15 08:00:00	45000	disponible
21	2	1	1	1	VOY031	2025-12-20 08:00:00	2025-12-20 08:00:00	45000	disponible
22	2	1	1	1	VOY032	2026-01-05 08:00:00	2026-01-05 08:00:00	45000	disponible
23	2	2	1	1	VOY033	2025-11-08 09:00:00	2025-11-08 09:00:00	40000	terminé
24	2	2	1	1	VOY034	2025-11-13 09:00:00	2025-11-13 09:00:00	42000	terminé
25	2	2	1	1	VOY035	2025-11-19 09:00:00	2025-11-19 09:00:00	42000	terminé
26	2	2	1	1	VOY036	2026-01-10 09:00:00	2026-01-10 09:00:00	45000	disponible
27	2	2	1	1	VOY037	2026-01-15 09:00:00	2026-01-15 09:00:00	45000	disponible
28	2	3	1	1	VOY038	2025-11-02 07:30:00	2025-11-02 07:30:00	45000	terminé
29	10	3	1	2	VOY039	2025-11-06 06:00:00	2025-11-06 06:00:00	30000	terminé
30	4	4	1	1	VOY040	2025-11-03 08:30:00	2025-11-03 08:30:00	50000	terminé
31	5	4	1	2	VOY041	2025-11-09 09:00:00	2025-11-09 09:00:00	80000	terminé
32	3	5	1	1	VOY042	2025-11-04 08:00:00	2025-11-04 08:00:00	55000	terminé
33	4	5	1	2	VOY043	2025-11-10 08:30:00	2025-11-10 08:30:00	60000	terminé
34	2	6	1	1	VOY044	2025-11-05 07:30:00	2025-11-05 07:30:00	45000	terminé
35	10	6	1	2	VOY045	2025-11-11 06:00:00	2025-11-11 06:00:00	30000	terminé
36	8	7	1	1	VOY046	2025-11-06 08:00:00	2025-11-06 08:00:00	70000	terminé
37	9	7	1	2	VOY047	2025-11-12 08:00:00	2025-11-12 08:00:00	40000	terminé
38	3	8	1	1	VOY048	2025-11-07 08:00:00	2025-11-07 08:00:00	55000	terminé
39	7	8	1	2	VOY049	2025-11-13 08:00:00	2025-11-13 08:00:00	60000	terminé
40	3	9	1	1	VOY050	2025-11-08 08:00:00	2025-11-08 08:00:00	55000	terminé
41	4	9	1	2	VOY051	2025-11-14 08:00:00	2025-11-14 08:00:00	60000	terminé
42	2	10	1	1	VOY052	2025-11-09 07:00:00	2025-11-09 07:00:00	60000	terminé
43	3	10	1	2	VOY053	2025-11-15 07:30:00	2025-11-15 07:30:00	90000	terminé
44	2	3	1	1	VOY054	2026-01-20 07:30:00	2026-01-20 07:30:00	45000	disponible
45	2	3	1	1	VOY055	2026-01-25 07:30:00	2026-01-25 07:30:00	45000	disponible
46	2	6	1	1	VOY056	2026-01-18 07:30:00	2026-01-18 07:30:00	45000	disponible
47	2	6	1	1	VOY057	2026-01-22 07:30:00	2026-01-22 07:30:00	45000	disponible
48	2	10	1	1	VOY058	2026-01-28 07:30:00	2026-01-28 07:30:00	60000	disponible
49	2	10	1	1	VOY059	2026-02-02 07:30:00	2026-02-02 07:30:00	60000	disponible
\.


--
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 222
-- Name: avis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.avis_id_seq', 25, true);


--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 224
-- Name: chauffeur_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chauffeur_id_seq', 11, true);


--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 227
-- Name: cooperative_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cooperative_id_seq', 1, false);


--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 230
-- Name: document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.document_id_seq', 1, false);


--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 232
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_id_seq', 10, true);


--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 234
-- Name: paiement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.paiement_id_seq', 44, true);


--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 236
-- Name: passager_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.passager_id_seq', 13, true);


--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 216
-- Name: place_voiture_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.place_voiture_id_seq', 503, true);


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 238
-- Name: recu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recu_id_seq', 9, true);


--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 240
-- Name: reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservation_id_seq', 53, true);


--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 218
-- Name: reservation_place_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservation_place_id_seq', 25, true);


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 243
-- Name: station_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.station_id_seq', 11, true);


--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 246
-- Name: trajet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trajet_id_seq', 10, true);


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 248
-- Name: utilisateur_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utilisateur_id_seq', 14, true);


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 250
-- Name: voiture_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.voiture_id_seq', 11, true);


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 253
-- Name: voyage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.voyage_id_seq', 49, true);


--
-- TOC entry 4816 (class 2606 OID 17385)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 17414)
-- Name: admin_cooperative admin_cooperative_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_cooperative
    ADD CONSTRAINT admin_cooperative_pkey PRIMARY KEY (admin_id, cooperative_id);


--
-- TOC entry 4825 (class 2606 OID 17409)
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 17423)
-- Name: avis avis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT avis_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 17432)
-- Name: chauffeur chauffeur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chauffeur
    ADD CONSTRAINT chauffeur_pkey PRIMARY KEY (id);


--
-- TOC entry 4838 (class 2606 OID 17437)
-- Name: client client_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (id);


--
-- TOC entry 4841 (class 2606 OID 17446)
-- Name: cooperative cooperative_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cooperative
    ADD CONSTRAINT cooperative_pkey PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 17451)
-- Name: doctrine_migration_versions doctrine_migration_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctrine_migration_versions
    ADD CONSTRAINT doctrine_migration_versions_pkey PRIMARY KEY (version);


--
-- TOC entry 4845 (class 2606 OID 17460)
-- Name: document document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_pkey PRIMARY KEY (id);


--
-- TOC entry 4849 (class 2606 OID 17469)
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- TOC entry 4852 (class 2606 OID 17478)
-- Name: paiement paiement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiement
    ADD CONSTRAINT paiement_pkey PRIMARY KEY (id);


--
-- TOC entry 4856 (class 2606 OID 17485)
-- Name: passager passager_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passager
    ADD CONSTRAINT passager_pkey PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 17397)
-- Name: place_voiture place_voiture_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_voiture
    ADD CONSTRAINT place_voiture_pkey PRIMARY KEY (id);


--
-- TOC entry 4859 (class 2606 OID 17492)
-- Name: recu recu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recu
    ADD CONSTRAINT recu_pkey PRIMARY KEY (id);


--
-- TOC entry 4865 (class 2606 OID 17499)
-- Name: reservation reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_pkey PRIMARY KEY (id);


--
-- TOC entry 4822 (class 2606 OID 17404)
-- Name: reservation_place reservation_place_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_place
    ADD CONSTRAINT reservation_place_pkey PRIMARY KEY (id);


--
-- TOC entry 4868 (class 2606 OID 17504)
-- Name: responsable_cooperative responsable_cooperative_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responsable_cooperative
    ADD CONSTRAINT responsable_cooperative_pkey PRIMARY KEY (id);


--
-- TOC entry 4871 (class 2606 OID 17513)
-- Name: station station_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station
    ADD CONSTRAINT station_pkey PRIMARY KEY (id);


--
-- TOC entry 4875 (class 2606 OID 17518)
-- Name: station_trajet station_trajet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_trajet
    ADD CONSTRAINT station_trajet_pkey PRIMARY KEY (station_id, trajet_id);


--
-- TOC entry 4877 (class 2606 OID 17525)
-- Name: trajet trajet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trajet
    ADD CONSTRAINT trajet_pkey PRIMARY KEY (id);


--
-- TOC entry 4881 (class 2606 OID 17534)
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id);


--
-- TOC entry 4889 (class 2606 OID 17546)
-- Name: voiture_chauffeur voiture_chauffeur_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voiture_chauffeur
    ADD CONSTRAINT voiture_chauffeur_pkey PRIMARY KEY (voiture_id, chauffeur_id);


--
-- TOC entry 4885 (class 2606 OID 17541)
-- Name: voiture voiture_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voiture
    ADD CONSTRAINT voiture_pkey PRIMARY KEY (id);


--
-- TOC entry 4895 (class 2606 OID 17553)
-- Name: voyage voyage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voyage
    ADD CONSTRAINT voyage_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 1259 OID 17583)
-- Name: idx_3f9d8955292f555c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_3f9d8955292f555c ON public.voyage USING btree (code_voiture_id);


--
-- TOC entry 4891 (class 1259 OID 17584)
-- Name: idx_3f9d89554ee841db; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_3f9d89554ee841db ON public.voyage USING btree (code_chauffeur_id);


--
-- TOC entry 4892 (class 1259 OID 17585)
-- Name: idx_3f9d8955a157d01b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_3f9d8955a157d01b ON public.voyage USING btree (code_trajet_id);


--
-- TOC entry 4893 (class 1259 OID 17586)
-- Name: idx_3f9d8955c6359aba; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_3f9d8955c6359aba ON public.voyage USING btree (code_cooperative_id);


--
-- TOC entry 4860 (class 1259 OID 17569)
-- Name: idx_42c8495518fc5a88; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_42c8495518fc5a88 ON public.reservation USING btree (code_responsable_id);


--
-- TOC entry 4861 (class 1259 OID 17570)
-- Name: idx_42c84955a157d01b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_42c84955a157d01b ON public.reservation USING btree (code_trajet_id);


--
-- TOC entry 4862 (class 1259 OID 17571)
-- Name: idx_42c84955b5ae1119; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_42c84955b5ae1119 ON public.reservation USING btree (code_client_id);


--
-- TOC entry 4863 (class 1259 OID 17572)
-- Name: idx_42c84955c48c9d97; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_42c84955c48c9d97 ON public.reservation USING btree (code_voyage_id);


--
-- TOC entry 4866 (class 1259 OID 17573)
-- Name: idx_71f3f588c6359aba; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_71f3f588c6359aba ON public.responsable_cooperative USING btree (code_cooperative_id);


--
-- TOC entry 4832 (class 1259 OID 17559)
-- Name: idx_8f91abf0b5ae1119; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_8f91abf0b5ae1119 ON public.avis USING btree (code_client_id);


--
-- TOC entry 4833 (class 1259 OID 17560)
-- Name: idx_8f91abf0c48c9d97; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_8f91abf0c48c9d97 ON public.avis USING btree (code_voyage_id);


--
-- TOC entry 4869 (class 1259 OID 17574)
-- Name: idx_9f39f8b1c6359aba; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_9f39f8b1c6359aba ON public.station USING btree (code_cooperative_id);


--
-- TOC entry 4850 (class 1259 OID 17565)
-- Name: idx_b1dc7a1ef30b501d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_b1dc7a1ef30b501d ON public.paiement USING btree (code_reservation_id);


--
-- TOC entry 4847 (class 1259 OID 17564)
-- Name: idx_bf5476cab61ed040; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bf5476cab61ed040 ON public.notification USING btree (ref_utilisateur_id);


--
-- TOC entry 4853 (class 1259 OID 17566)
-- Name: idx_bff42ee9b5ae1119; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bff42ee9b5ae1119 ON public.passager USING btree (code_client_id);


--
-- TOC entry 4854 (class 1259 OID 17567)
-- Name: idx_bff42ee9c48c9d97; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bff42ee9c48c9d97 ON public.passager USING btree (code_voyage_id);


--
-- TOC entry 4857 (class 1259 OID 17568)
-- Name: idx_c0d10317f30b501d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_c0d10317f30b501d ON public.recu USING btree (code_reservation_id);


--
-- TOC entry 4886 (class 1259 OID 17581)
-- Name: idx_c6d358fc181a8ba; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_c6d358fc181a8ba ON public.voiture_chauffeur USING btree (voiture_id);


--
-- TOC entry 4887 (class 1259 OID 17582)
-- Name: idx_c6d358fc85c0b3be; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_c6d358fc85c0b3be ON public.voiture_chauffeur USING btree (chauffeur_id);


--
-- TOC entry 4839 (class 1259 OID 17562)
-- Name: idx_c74404551e53ac7d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_c74404551e53ac7d ON public.client USING btree (ref_responsable_id);


--
-- TOC entry 4846 (class 1259 OID 17563)
-- Name: idx_d8698a76292f555c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_d8698a76292f555c ON public.document USING btree (code_voiture_id);


--
-- TOC entry 4872 (class 1259 OID 17575)
-- Name: idx_e4b9ba6a21bdb235; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_e4b9ba6a21bdb235 ON public.station_trajet USING btree (station_id);


--
-- TOC entry 4873 (class 1259 OID 17576)
-- Name: idx_e4b9ba6ad12a823; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_e4b9ba6ad12a823 ON public.station_trajet USING btree (trajet_id);


--
-- TOC entry 4882 (class 1259 OID 17579)
-- Name: idx_e9e2810f9134fd3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_e9e2810f9134fd3 ON public.voiture USING btree (code_station_id);


--
-- TOC entry 4883 (class 1259 OID 17580)
-- Name: idx_e9e2810fc6359aba; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_e9e2810fc6359aba ON public.voiture USING btree (code_cooperative_id);


--
-- TOC entry 4828 (class 1259 OID 17557)
-- Name: idx_ec1d9572642b8210; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ec1d9572642b8210 ON public.admin_cooperative USING btree (admin_id);


--
-- TOC entry 4829 (class 1259 OID 17558)
-- Name: idx_ec1d95728d0c5d40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ec1d95728d0c5d40 ON public.admin_cooperative USING btree (cooperative_id);


--
-- TOC entry 4819 (class 1259 OID 17554)
-- Name: place_voiture_voiture_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX place_voiture_voiture_id_idx ON public.place_voiture USING btree (voiture_id);


--
-- TOC entry 4820 (class 1259 OID 17555)
-- Name: place_voiture_voiture_id_numero_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX place_voiture_voiture_id_numero_key ON public.place_voiture USING btree (voiture_id, numero);


--
-- TOC entry 4823 (class 1259 OID 17556)
-- Name: reservation_place_reservation_id_place_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX reservation_place_reservation_id_place_id_key ON public.reservation_place USING btree (reservation_id, place_id);


--
-- TOC entry 4878 (class 1259 OID 17577)
-- Name: uniq_1d1c63b3e7927c74; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_1d1c63b3e7927c74 ON public.utilisateur USING btree (email);


--
-- TOC entry 4836 (class 1259 OID 17561)
-- Name: uniq_5ca777b8abe530da; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uniq_5ca777b8abe530da ON public.chauffeur USING btree (cin);


--
-- TOC entry 4879 (class 1259 OID 17578)
-- Name: utilisateur_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX utilisateur_email_idx ON public.utilisateur USING btree (email);


--
-- TOC entry 4925 (class 2606 OID 17732)
-- Name: voyage fk_3f9d8955292f555c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voyage
    ADD CONSTRAINT fk_3f9d8955292f555c FOREIGN KEY (code_voiture_id) REFERENCES public.voiture(id);


--
-- TOC entry 4926 (class 2606 OID 17737)
-- Name: voyage fk_3f9d89554ee841db; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voyage
    ADD CONSTRAINT fk_3f9d89554ee841db FOREIGN KEY (code_chauffeur_id) REFERENCES public.chauffeur(id);


--
-- TOC entry 4927 (class 2606 OID 17742)
-- Name: voyage fk_3f9d8955a157d01b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voyage
    ADD CONSTRAINT fk_3f9d8955a157d01b FOREIGN KEY (code_trajet_id) REFERENCES public.trajet(id);


--
-- TOC entry 4928 (class 2606 OID 17747)
-- Name: voyage fk_3f9d8955c6359aba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voyage
    ADD CONSTRAINT fk_3f9d8955c6359aba FOREIGN KEY (code_cooperative_id) REFERENCES public.cooperative(id);


--
-- TOC entry 4912 (class 2606 OID 17667)
-- Name: reservation fk_42c8495518fc5a88; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT fk_42c8495518fc5a88 FOREIGN KEY (code_responsable_id) REFERENCES public.responsable_cooperative(id);


--
-- TOC entry 4913 (class 2606 OID 17672)
-- Name: reservation fk_42c84955a157d01b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT fk_42c84955a157d01b FOREIGN KEY (code_trajet_id) REFERENCES public.trajet(id);


--
-- TOC entry 4914 (class 2606 OID 17677)
-- Name: reservation fk_42c84955b5ae1119; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT fk_42c84955b5ae1119 FOREIGN KEY (code_client_id) REFERENCES public.client(id);


--
-- TOC entry 4915 (class 2606 OID 17682)
-- Name: reservation fk_42c84955c48c9d97; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT fk_42c84955c48c9d97 FOREIGN KEY (code_voyage_id) REFERENCES public.voyage(id);


--
-- TOC entry 4916 (class 2606 OID 17687)
-- Name: responsable_cooperative fk_71f3f588bf396750; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responsable_cooperative
    ADD CONSTRAINT fk_71f3f588bf396750 FOREIGN KEY (id) REFERENCES public.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 4917 (class 2606 OID 17692)
-- Name: responsable_cooperative fk_71f3f588c6359aba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responsable_cooperative
    ADD CONSTRAINT fk_71f3f588c6359aba FOREIGN KEY (code_cooperative_id) REFERENCES public.cooperative(id);


--
-- TOC entry 4899 (class 2606 OID 17602)
-- Name: admin fk_880e0d76bf396750; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT fk_880e0d76bf396750 FOREIGN KEY (id) REFERENCES public.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 4902 (class 2606 OID 17617)
-- Name: avis fk_8f91abf0b5ae1119; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT fk_8f91abf0b5ae1119 FOREIGN KEY (code_client_id) REFERENCES public.client(id);


--
-- TOC entry 4903 (class 2606 OID 17622)
-- Name: avis fk_8f91abf0c48c9d97; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avis
    ADD CONSTRAINT fk_8f91abf0c48c9d97 FOREIGN KEY (code_voyage_id) REFERENCES public.voyage(id);


--
-- TOC entry 4918 (class 2606 OID 17697)
-- Name: station fk_9f39f8b1c6359aba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station
    ADD CONSTRAINT fk_9f39f8b1c6359aba FOREIGN KEY (code_cooperative_id) REFERENCES public.cooperative(id);


--
-- TOC entry 4908 (class 2606 OID 17647)
-- Name: paiement fk_b1dc7a1ef30b501d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paiement
    ADD CONSTRAINT fk_b1dc7a1ef30b501d FOREIGN KEY (code_reservation_id) REFERENCES public.reservation(id);


--
-- TOC entry 4907 (class 2606 OID 17642)
-- Name: notification fk_bf5476cab61ed040; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT fk_bf5476cab61ed040 FOREIGN KEY (ref_utilisateur_id) REFERENCES public.utilisateur(id);


--
-- TOC entry 4909 (class 2606 OID 17652)
-- Name: passager fk_bff42ee9b5ae1119; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passager
    ADD CONSTRAINT fk_bff42ee9b5ae1119 FOREIGN KEY (code_client_id) REFERENCES public.client(id);


--
-- TOC entry 4910 (class 2606 OID 17657)
-- Name: passager fk_bff42ee9c48c9d97; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passager
    ADD CONSTRAINT fk_bff42ee9c48c9d97 FOREIGN KEY (code_voyage_id) REFERENCES public.voyage(id);


--
-- TOC entry 4911 (class 2606 OID 17662)
-- Name: recu fk_c0d10317f30b501d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recu
    ADD CONSTRAINT fk_c0d10317f30b501d FOREIGN KEY (code_reservation_id) REFERENCES public.reservation(id);


--
-- TOC entry 4923 (class 2606 OID 17722)
-- Name: voiture_chauffeur fk_c6d358fc181a8ba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voiture_chauffeur
    ADD CONSTRAINT fk_c6d358fc181a8ba FOREIGN KEY (voiture_id) REFERENCES public.voiture(id) ON DELETE CASCADE;


--
-- TOC entry 4924 (class 2606 OID 17727)
-- Name: voiture_chauffeur fk_c6d358fc85c0b3be; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voiture_chauffeur
    ADD CONSTRAINT fk_c6d358fc85c0b3be FOREIGN KEY (chauffeur_id) REFERENCES public.chauffeur(id) ON DELETE CASCADE;


--
-- TOC entry 4904 (class 2606 OID 17627)
-- Name: client fk_c74404551e53ac7d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT fk_c74404551e53ac7d FOREIGN KEY (ref_responsable_id) REFERENCES public.responsable_cooperative(id);


--
-- TOC entry 4905 (class 2606 OID 17632)
-- Name: client fk_c7440455bf396750; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT fk_c7440455bf396750 FOREIGN KEY (id) REFERENCES public.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 4906 (class 2606 OID 17637)
-- Name: document fk_d8698a76292f555c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document
    ADD CONSTRAINT fk_d8698a76292f555c FOREIGN KEY (code_voiture_id) REFERENCES public.voiture(id);


--
-- TOC entry 4919 (class 2606 OID 17702)
-- Name: station_trajet fk_e4b9ba6a21bdb235; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_trajet
    ADD CONSTRAINT fk_e4b9ba6a21bdb235 FOREIGN KEY (station_id) REFERENCES public.station(id) ON DELETE CASCADE;


--
-- TOC entry 4920 (class 2606 OID 17707)
-- Name: station_trajet fk_e4b9ba6ad12a823; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_trajet
    ADD CONSTRAINT fk_e4b9ba6ad12a823 FOREIGN KEY (trajet_id) REFERENCES public.trajet(id) ON DELETE CASCADE;


--
-- TOC entry 4921 (class 2606 OID 17712)
-- Name: voiture fk_e9e2810f9134fd3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voiture
    ADD CONSTRAINT fk_e9e2810f9134fd3 FOREIGN KEY (code_station_id) REFERENCES public.station(id);


--
-- TOC entry 4922 (class 2606 OID 17717)
-- Name: voiture fk_e9e2810fc6359aba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.voiture
    ADD CONSTRAINT fk_e9e2810fc6359aba FOREIGN KEY (code_cooperative_id) REFERENCES public.cooperative(id);


--
-- TOC entry 4900 (class 2606 OID 17607)
-- Name: admin_cooperative fk_ec1d9572642b8210; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_cooperative
    ADD CONSTRAINT fk_ec1d9572642b8210 FOREIGN KEY (admin_id) REFERENCES public.admin(id) ON DELETE CASCADE;


--
-- TOC entry 4901 (class 2606 OID 17612)
-- Name: admin_cooperative fk_ec1d95728d0c5d40; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_cooperative
    ADD CONSTRAINT fk_ec1d95728d0c5d40 FOREIGN KEY (cooperative_id) REFERENCES public.cooperative(id) ON DELETE CASCADE;


--
-- TOC entry 4896 (class 2606 OID 17587)
-- Name: place_voiture place_voiture_voiture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_voiture
    ADD CONSTRAINT place_voiture_voiture_id_fkey FOREIGN KEY (voiture_id) REFERENCES public.voiture(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4897 (class 2606 OID 17597)
-- Name: reservation_place reservation_place_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_place
    ADD CONSTRAINT reservation_place_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.place_voiture(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4898 (class 2606 OID 17592)
-- Name: reservation_place reservation_place_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_place
    ADD CONSTRAINT reservation_place_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservation(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-12-10 15:08:04

--
-- PostgreSQL database dump complete
--

\unrestrict hROJkc9JImAP2x4CIvLUfTse99HWIwzOlSugeVJH3WywzVJvNWSexuw4gZIRE95

