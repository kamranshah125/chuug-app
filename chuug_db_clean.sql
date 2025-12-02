--
-- PostgreSQL database dump
--

\restrict z7caaLtK0e3zNHshruRkZ4qKuyvuKQTtadwulc1Ca3yhSLpe9mG7mRmomNfBS0h

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Allocation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Allocation" (
    id integer NOT NULL,
    "orderId" text NOT NULL,
    "capacityId" integer NOT NULL,
    "despatchDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Allocation" OWNER TO postgres;

--
-- Name: Allocation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Allocation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Allocation_id_seq" OWNER TO postgres;

--
-- Name: Allocation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Allocation_id_seq" OWNED BY public."Allocation".id;


--
-- Name: Capacity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Capacity" (
    id integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "totalCapacity" integer NOT NULL,
    "usedCapacity" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    closed boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Capacity" OWNER TO postgres;

--
-- Name: Capacity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Capacity_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Capacity_id_seq" OWNER TO postgres;

--
-- Name: Capacity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Capacity_id_seq" OWNED BY public."Capacity".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    "customerName" text NOT NULL,
    quantity integer NOT NULL,
    "orderDate" timestamp(3) without time zone NOT NULL,
    "deliveryDate" timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    "userId" integer NOT NULL,
    "productId" integer NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Order_id_seq" OWNER TO postgres;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    sku text NOT NULL,
    "productionTime" integer NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Product_id_seq" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    shop text NOT NULL,
    state text NOT NULL,
    "isOnline" boolean DEFAULT false NOT NULL,
    scope text,
    expires timestamp(3) without time zone,
    "accessToken" text NOT NULL,
    "userId" bigint,
    "firstName" text,
    "lastName" text,
    email text,
    "accountOwner" boolean DEFAULT false NOT NULL,
    locale text,
    collaborator boolean DEFAULT false,
    "emailVerified" boolean DEFAULT false
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: StoreSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreSettings" (
    id integer NOT NULL,
    shop text NOT NULL,
    timezone text DEFAULT 'Europe/London'::text NOT NULL,
    "defaultDespatchLead" integer DEFAULT 1 NOT NULL,
    "defaultDeliveryLead" integer DEFAULT 2 NOT NULL,
    "countryOverrides" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "accessToken" text
);


ALTER TABLE public."StoreSettings" OWNER TO postgres;

--
-- Name: StoreSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."StoreSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StoreSettings_id_seq" OWNER TO postgres;

--
-- Name: StoreSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."StoreSettings_id_seq" OWNED BY public."StoreSettings".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
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
-- Name: Allocation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Allocation" ALTER COLUMN id SET DEFAULT nextval('public."Allocation_id_seq"'::regclass);


--
-- Name: Capacity id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Capacity" ALTER COLUMN id SET DEFAULT nextval('public."Capacity_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: StoreSettings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreSettings" ALTER COLUMN id SET DEFAULT nextval('public."StoreSettings_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Allocation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Allocation" (id, "orderId", "capacityId", "despatchDate", "createdAt") FROM stdin;
1	12345	91	2025-11-21 00:00:00	2025-11-19 12:43:43.494
2	820982911946154500	91	2025-11-21 00:00:00	2025-11-19 13:47:16.734
3	820982911946154500	91	2025-11-21 00:00:00	2025-11-19 13:47:56.855
4	820982911946154500	91	2025-11-21 00:00:00	2025-11-19 13:48:41.631
5	123456	91	2025-11-21 00:00:00	2025-11-19 13:49:19.851
6	820982911946154500	91	2025-11-21 00:00:00	2025-11-19 18:24:06.519
\.


--
-- Data for Name: Capacity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Capacity" (id, date, "totalCapacity", "usedCapacity", "createdAt", "updatedAt", closed) FROM stdin;
92	2025-11-24 00:00:00	100	0	2025-11-14 19:28:21.631	2025-11-14 19:28:21.631	f
93	2025-11-25 00:00:00	100	0	2025-11-14 19:28:21.633	2025-11-14 19:28:21.633	f
94	2025-11-26 00:00:00	100	0	2025-11-14 19:28:21.635	2025-11-14 19:28:21.635	f
86	2025-11-16 00:00:00	100	100	2025-11-14 19:27:51.982	2025-11-18 11:09:13.632	f
87	2025-11-17 00:00:00	100	94	2025-11-14 19:27:52	2025-11-18 11:09:35.498	f
88	2025-11-18 00:00:00	100	100	2025-11-14 19:27:52.005	2025-11-18 12:16:47.816	f
89	2025-11-19 00:00:00	1003	1003	2025-11-14 19:27:52.01	2025-11-18 12:23:14.361	f
90	2025-11-20 00:00:00	100	100	2025-11-14 19:27:52.014	2025-11-18 12:23:29.047	f
95	2025-11-27 00:00:00	100	0	2025-11-18 12:29:22.081	2025-11-18 12:29:22.081	f
96	2025-11-28 00:00:00	100	0	2025-11-18 12:29:22.094	2025-11-18 12:29:22.094	f
97	2025-12-01 00:00:00	100	0	2025-11-18 12:29:22.097	2025-11-18 12:29:22.097	f
98	2025-12-02 00:00:00	100	0	2025-11-18 12:29:22.101	2025-11-18 12:29:22.101	f
99	2025-12-03 00:00:00	100	0	2025-11-18 12:29:22.104	2025-11-18 12:29:22.104	f
100	2025-12-04 00:00:00	100	0	2025-11-18 12:29:22.107	2025-11-18 12:29:22.107	f
101	2025-12-05 00:00:00	100	0	2025-11-18 12:29:22.11	2025-11-18 12:29:22.11	f
102	2025-12-08 00:00:00	100	0	2025-11-18 12:29:22.113	2025-11-18 12:29:22.113	f
103	2025-12-09 00:00:00	100	0	2025-11-18 12:29:22.115	2025-11-18 12:29:22.115	f
104	2025-12-10 00:00:00	100	0	2025-11-18 12:29:22.118	2025-11-18 12:29:22.118	f
105	2025-12-11 00:00:00	100	0	2025-11-18 12:29:22.121	2025-11-18 12:29:22.121	f
106	2025-12-12 00:00:00	100	0	2025-11-18 12:29:22.124	2025-11-18 12:29:22.124	f
107	2025-12-15 00:00:00	100	0	2025-11-18 12:29:22.126	2025-11-18 12:29:22.126	f
108	2025-12-16 00:00:00	100	0	2025-11-18 12:29:22.127	2025-11-18 12:29:22.127	f
109	2025-12-17 00:00:00	100	0	2025-11-18 12:29:22.129	2025-11-18 12:29:22.129	f
110	2025-12-18 00:00:00	100	0	2025-11-18 12:29:22.13	2025-11-18 12:29:22.13	f
111	2025-12-19 00:00:00	100	0	2025-11-18 12:29:22.133	2025-11-18 12:29:22.133	f
112	2025-12-22 00:00:00	100	0	2025-11-18 12:29:22.134	2025-11-18 12:29:22.134	f
113	2025-12-23 00:00:00	100	0	2025-11-18 12:29:22.137	2025-11-18 12:29:22.137	f
114	2025-12-24 00:00:00	100	0	2025-11-18 12:29:22.143	2025-11-18 12:29:22.143	f
115	2025-12-25 00:00:00	100	0	2025-11-18 12:29:22.146	2025-11-18 12:29:22.146	f
116	2025-12-26 00:00:00	100	0	2025-11-18 12:29:22.151	2025-11-18 12:29:22.151	f
117	2025-12-29 00:00:00	100	0	2025-11-18 12:29:22.154	2025-11-18 12:29:22.154	f
91	2025-11-21 00:00:00	100	14	2025-11-14 19:28:21.63	2025-11-19 18:24:06.504	f
118	2025-12-30 00:00:00	20	0	2025-11-24 14:12:17.377	2025-11-24 14:12:17.377	f
119	2025-12-31 00:00:00	20	0	2025-11-24 14:12:17.415	2025-11-24 14:12:17.415	f
120	2026-01-01 00:00:00	20	0	2025-11-24 14:12:17.419	2025-11-24 14:12:17.419	f
121	2026-01-02 00:00:00	20	0	2025-11-24 14:12:17.423	2025-11-24 14:12:17.423	f
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "customerName", quantity, "orderDate", "deliveryDate", status, "userId", "productId") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, category, sku, "productionTime") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, shop, state, "isOnline", scope, expires, "accessToken", "userId", "firstName", "lastName", email, "accountOwner", locale, collaborator, "emailVerified") FROM stdin;
offline_chuug-2.myshopify.com	chuug-2.myshopify.com		f	write_products	\N	shpua_9fd641106cf936ec2ff4ae9a6f79caaa	\N	\N	\N	\N	f	\N	f	f
\.


--
-- Data for Name: StoreSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreSettings" (id, shop, timezone, "defaultDespatchLead", "defaultDeliveryLead", "countryOverrides", "createdAt", "updatedAt", "accessToken") FROM stdin;
1	chuug-2.myshopify.com	Europe/London	1	2	{"GB": {"deliveryLead": 2, "despatchLead": 1}}	2025-11-19 11:21:55.95	2025-11-19 11:21:55.95	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, "createdAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
87685fc0-4ed7-4d1c-b04f-6d75132586dd	80c387d67096ff4c9e04bcfadd3ec50039af673fa6d119738a1e7c46f92f7e1e	2025-11-12 18:30:50.50181+05	20251112133050_init	\N	\N	2025-11-12 18:30:50.450752+05	1
8718c293-eb34-4ac2-9560-fb04b1566827	0101166c16556c4ce6ab823086444a2a6df08e15c1ede9ea049e8f6e83fac336	2025-11-18 20:56:37.056616+05	20251118155636_add_capacity_and_settings	\N	\N	2025-11-18 20:56:37.01002+05	1
f80b0351-5f0a-413a-9a42-e280bb495a97	55da1a5fcdb12dc9b07865c71011ec5e8dd93bddffb0b1680b565c836787290e	2025-11-19 15:57:56.438544+05	20251119105756_add_access_token	\N	\N	2025-11-19 15:57:56.430568+05	1
\.


--
-- Name: Allocation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Allocation_id_seq"', 6, true);


--
-- Name: Capacity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Capacity_id_seq"', 121, true);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Order_id_seq"', 1, false);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Product_id_seq"', 1, false);


--
-- Name: StoreSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."StoreSettings_id_seq"', 1, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: Allocation Allocation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Allocation"
    ADD CONSTRAINT "Allocation_pkey" PRIMARY KEY (id);


--
-- Name: Capacity Capacity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Capacity"
    ADD CONSTRAINT "Capacity_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: StoreSettings StoreSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreSettings"
    ADD CONSTRAINT "StoreSettings_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Capacity_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Capacity_date_key" ON public."Capacity" USING btree (date);


--
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- Name: StoreSettings_shop_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StoreSettings_shop_key" ON public."StoreSettings" USING btree (shop);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Order Order_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict z7caaLtK0e3zNHshruRkZ4qKuyvuKQTtadwulc1Ca3yhSLpe9mG7mRmomNfBS0h

