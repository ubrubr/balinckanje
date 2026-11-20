-- Single publicly readable and writable tournament document. Public administration requested by owner.
-- Existing g-hub tables remain unchanged.
CREATE TABLE IF NOT EXISTS public.balinckanje_state (
 id smallint PRIMARY KEY DEFAULT 1 CHECK(id=1),
 revision bigint NOT NULL DEFAULT 0 CHECK(revision>=0),
 data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(data)='object'),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.balinckanje_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.balinckanje_state FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.balinckanje_state TO anon,authenticated;
GRANT UPDATE(revision,data,updated_at) ON public.balinckanje_state TO anon,authenticated;
DROP POLICY IF EXISTS balinckanje_public_read ON public.balinckanje_state;
DROP POLICY IF EXISTS balinckanje_public_update ON public.balinckanje_state;
CREATE POLICY balinckanje_public_read ON public.balinckanje_state FOR SELECT TO anon,authenticated USING(id=1);
CREATE POLICY balinckanje_public_update ON public.balinckanje_state FOR UPDATE TO anon,authenticated USING(id=1) WITH CHECK(id=1);
-- Seed only when row doesn't exist: production state is never overwritten.
INSERT INTO public.balinckanje_state(id,revision,data) VALUES
(1,0,'{"players":[{"id":"p1","name":"Anže B."},{"id":"p2","name":"Urban Č."},{"id":"p3","name":"Dejan L."},{"id":"p4","name":"Jan S."},{"id":"p5","name":"Jan R."},{"id":"p6","name":"Marjan C."},{"id":"p7","name":"Benjamin P."},{"id":"p8","name":"Stanko Z."},{"id":"p9","name":"Jakob R."},{"id":"p10","name":"Zdravko B."},{"id":"p11","name":"Iztok Š."},{"id":"p12","name":"Borut G."},{"id":"p13","name":"Marko T."},{"id":"p14","name":"Marko D."},{"id":"p15","name":"Kristina M."},{"id":"p16","name":"Tone G."}],"draw":{"assignments":null,"order":[],"startedAt":null,"introMs":5000,"stepMs":8500,"spinMs":7140,"finalMs":30000,"loop":false},"groupTeams":{"A":[1,2,3,4],"B":[5,6,7,8]},"games":{},"displayMode":"zreb","roundView":"1","autoToTeams":true,"tieBreaks":{}}'::jsonb) ON CONFLICT(id) DO NOTHING;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime')
 AND NOT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='balinckanje_state')
 THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.balinckanje_state; END IF;
END $$;
