# PasanakuYa — Documento Base del Producto

> **Versión:** 1.0.0  
> **Fecha:** 2026-02-17  
> **Autor:** ECOTRAFFIC Team  
> **Estado:** Definición inicial

---

## 1. Visión del Producto

### 1.1 Declaración de Visión

**PasanakuYa** es la plataforma digital líder para organizar, gestionar y participar en pasanakus de forma segura, transparente y sin fricción — democratizando el ahorro colectivo en Bolivia y Latinoamérica.

### 1.2 Misión

Transformar el pasanaku tradicional en una experiencia digital confiable que:
- **Elimine el fraude y la desconfianza** con pagos verificables y trazabilidad total.
- **Simplifique la gestión** con automatización de cobros, turnos y recordatorios.
- **Incluya financieramente** a personas sin acceso bancario formal.
- **Preserve la tradición** respetando la esencia cultural del ahorro comunitario.

### 1.3 Propuesta de Valor Única (UVP)

> *"Tu pasanaku, pero sin el dolor de cabeza. Organiza, cobra y recibe — todo desde tu celular, con total transparencia y seguridad."*

### 1.4 Elevator Pitch

PasanakuYa es como un WhatsApp para pasanakus: creas un grupo, defines las reglas, y la app se encarga de recordar, cobrar y distribuir automáticamente. Sin llamadas incómodas, sin desconfianza, sin papel.

---

## 2. Análisis de Mercado

### 2.1 Problema

| Problema | Impacto | Frecuencia |
|----------|---------|------------|
| El organizador gasta horas cobrando manualmente | Alto | Cada ciclo |
| Participantes que no pagan a tiempo | Muy alto | ~30% de los ciclos |
| Desconfianza: "¿y si se va con la plata?" | Crítico | Barrera de entrada |
| No hay registro de pagos ni historial | Alto | Siempre |
| Dificultad para encontrar grupos confiables | Medio | Al inicio |
| Conflictos por el orden de turnos | Medio | Al inicio |

### 2.2 Mercado Objetivo

**TAM (Total Addressable Market):**
- Bolivia: ~12M habitantes, ~70% ha participado en un pasanaku = **~8.4M personas**
- Perú (juntas/panderos): ~33M habitantes, ~40% = **~13M personas**
- México (tandas): ~130M habitantes, ~30% = **~39M personas**
- **TAM total: ~60M personas en Latam**

**SAM (Serviceable Addressable Market):**
- Usuarios con smartphone en Bolivia: ~7M
- Que participan activamente en pasanakus: ~60%
- **SAM: ~4.2M personas en Bolivia**

**SOM (Serviceable Obtainable Market — Año 1):**
- Meta realista primer año: **50,000 usuarios activos** en Bolivia
- ~5,000 pasanakus activos mensuales

### 2.3 Competencia

| Competidor | Fortalezas | Debilidades | Diferenciador PasanakuYa |
|------------|-----------|-------------|--------------------------|
| **PasanaQ** | First mover, funding ($180K), WhatsApp bot | UX básica, sin pagos integrados, enfoque B2C puro | Pagos integrados + mejor UX + B2B/B2C |
| **BancoSol SolPasanaku** | Confianza bancaria, cuentas reales | Solo clientes BancoSol, rígido, no social | Abierto a todos, social, flexible |
| **WhatsApp (manual)** | Ubicuo, gratis, conocido | Sin automatización, sin trazabilidad, sin pagos | Automatización completa |
| **Excel/papel** | Simple | Sin time, propenso a errores | Digital, automático, con evidencia |

### 2.4 Ventaja Competitiva

1. **Pagos integrados**: QR bancario (Simple/BancoSol) + billeteras móviles (Tigo Money, etc.)
2. **Gamificación**: Reputación, badges, racha de pagos puntuales
3. **Social**: Descubrimiento de grupos, perfiles públicos de confiabilidad
4. **Dual market**: B2C (usuarios individuales) + B2B (comercios, empresas, cooperativas)

---

## 3. Usuarios y Personas

### 3.1 Persona Principal: El Organizador ("Pasanakero/a")

```
Nombre: Doña Martha
Edad: 38 años
Ocupación: Comerciante en feria (ropa)
Ciudad: Cochabamba
Smartphone: Android gama media
Conexión: 4G intermitente

Motivación: Organiza pasanakus de Bs 500/mes con 12 amigas 
            del mercado. Quiere dejar de perseguir a las morosas.

Frustraciones:
- 3 de las 12 siempre se atrasan en el pago
- Lleva la cuenta en un cuaderno que se mojó una vez
- Tuvo que poner de su bolsillo cuando alguien no pagó
- No sabe cómo cobrar sin parecer "pesada"

Lo que necesita:
- Recordatorios automáticos (que la app "sea la mala")
- Registro claro de quién pagó y quién no
- Sorteo transparente de turnos
- Forma fácil de cobrar sin confrontación
```

### 3.2 Persona Secundaria: El Participante

```
Nombre: Carlos
Edad: 27 años
Ocupación: Programador junior
Ciudad: Santa Cruz
Smartphone: Android gama media-alta
Conexión: WiFi + 4G

Motivación: Quiere ahorrar para comprar una laptop nueva (Bs 8,000).
            Sabe que solo no ahorrará. Necesita "presión social".

Frustraciones:
- No confía en organizadores que no conoce bien
- Quiere ver transparencia en los pagos de todos
- Le da pereza ir a depositar en efectivo
- No sabe cuándo es su turno exactamente

Lo que necesita:
- Ver el estado del pasanaku en tiempo real
- Pagar desde el celular (QR o transferencia)
- Notificaciones de cuándo pagar y cuándo recibe
- Saber que el organizador es confiable (reputación)
```

### 3.3 Persona Terciaria: El Empresario/Cooperativa

```
Nombre: Don Roberto
Edad: 52 años
Ocupación: Dueño de cooperativa de ahorro
Ciudad: La Paz

Motivación: Quiere ofrecer "pasanaku formal" a sus 2,000 socios 
            como servicio adicional para retenerlos.

Lo que necesita:
- White-label de la plataforma con su marca
- Reportes y auditoría
- Integración con su sistema de cuentas
- Comisión por administración
```

---

## 4. Funcionalidades del Producto

### 4.1 MVP (Versión 1.0) — Lanzamiento

#### 🔐 Autenticación
- [ ] Registro con número de celular (OTP por SMS)
- [ ] Login con OTP (sin contraseñas)
- [ ] Perfil básico: nombre, foto, ciudad
- [ ] Verificación de identidad opcional (CI)

#### 🏠 Home / Dashboard
- [ ] Mis pasanakus activos (como organizador y participante)
- [ ] Próximo pago pendiente (monto, fecha, a quién)
- [ ] Próximo turno de cobro
- [ ] Historial de pagos recientes
- [ ] Balance general: cuánto llevo aportado vs recibido

#### ➕ Crear Pasanaku
- [ ] Nombre del pasanaku
- [ ] Monto de aporte por persona
- [ ] Frecuencia: semanal, quincenal, mensual
- [ ] Número de participantes (5-30)
- [ ] Fecha de inicio
- [ ] Método de selección de turno: sorteo, acuerdo, subasta
- [ ] Reglas: penalización por atraso, gracia permitida
- [ ] Invitar participantes (link compartible, WhatsApp, contactos)

#### 👥 Gestión del Grupo
- [ ] Ver todos los participantes y su estado
- [ ] Chat grupal del pasanaku
- [ ] Aprobar/rechazar solicitudes de ingreso
- [ ] Reemplazar participante (antes de inicio)
- [ ] Estado de cada miembro: ✅ al día, ⚠️ atrasado, ❌ moroso

#### 🎲 Sorteo de Turnos
- [ ] Sorteo digital transparente (con animación)
- [ ] Registro inmutable del resultado
- [ ] Opción de intercambiar turnos (con acuerdo mutuo)
- [ ] Calendario visual de quién recibe cuándo

#### 💰 Pagos
- [ ] Registro manual de pago (foto de comprobante)
- [ ] Confirmación del organizador (aprobación de pago)
- [ ] Historial de pagos por participante
- [ ] Recordatorio automático 3 días antes, 1 día antes, día de pago
- [ ] Notificación de pago moroso al grupo
- [ ] Resumen mensual del estado financiero

#### 🔔 Notificaciones
- [ ] Push notifications
- [ ] WhatsApp (integración básica)
- [ ] Recordatorios de pago programados
- [ ] Notificación cuando alguien paga
- [ ] Notificación cuando es tu turno de recibir
- [ ] Alerta de morosidad

#### ⭐ Reputación
- [ ] Score de confianza (basado en historial de pagos)
- [ ] Badges: "Pago Puntual", "Organizador Estrella", "Participó en 10+"
- [ ] Historial público de pasanakus completados
- [ ] Calificación del organizador (1-5 estrellas)

---

### 4.2 Versión 2.0 — Crecimiento

#### 💳 Pagos Integrados
- [ ] QR Simple (sistema QR interbancario boliviano)
- [ ] Transferencia bancaria directa
- [ ] Billeteras móviles (Tigo Money, Vida Wallet)
- [ ] Confirmación automática de pago
- [ ] Dispersión automática al ganador del turno

#### 🔍 Descubrimiento Social
- [ ] Explorar pasanakus públicos abiertos
- [ ] Filtrar por: monto, frecuencia, ciudad, reputación del organizador
- [ ] Solicitar unirte a un pasanaku
- [ ] Pasanakus temáticos: "Navideño", "Escolar", "Viaje"

#### 📊 Analytics para Organizadores
- [ ] Dashboard: tasa de pago puntual, morosidad, tendencias
- [ ] Exportar reportes (PDF, Excel)
- [ ] Historial de todos los pasanakus organizados

#### 🎮 Gamificación Avanzada
- [ ] Niveles de usuario: Bronce → Plata → Oro → Platino
- [ ] Racha de pagos puntuales (streak)
- [ ] Logros desbloqueables
- [ ] Ranking de mejores pasanakeros por ciudad

---

### 4.3 Versión 3.0 — Monetización y Escala

#### 🏢 PasanakuYa Business (B2B)
- [ ] White-label para cooperativas y empresas
- [ ] API para integración con sistemas de RRHH
- [ ] Pasanaku empresarial (descuento de nómina)
- [ ] Dashboard administrativo avanzado

#### 🏦 Servicios Financieros
- [ ] Score crediticio basado en historial de pasanakus
- [ ] Microcréditos para usuarios con buen historial
- [ ] Cuenta de ahorro vinculada (partnership con banco)
- [ ] Seguro de pasanaku (cobertura ante morosos)

#### 🌎 Expansión Regional
- [ ] Peru (Juntas/Panderos)
- [ ] México (Tandas)
- [ ] Colombia (Natilleras/Vacas)
- [ ] Localización i18n por país

---

## 5. Modelo de Negocio

### 5.1 Fuentes de Ingreso

| Fuente | Descripción | Proyección Año 1 |
|--------|-------------|:-:|
| **Freemium** | App gratis con límites (max 2 pasanakus activos) | Base de usuarios |
| **PasanakuYa Pro** | Bs 15/mes: pasanakus ilimitados, analytics, prioridad | ~Bs 300K/año |
| **Comisión de pagos** | 1-2% en pagos integrados (QR/billetera) | ~Bs 200K/año |
| **PasanakuYa Business** | Suscripción para empresas/cooperativas | ~Bs 150K/año |
| **Seguro de pasanaku** | Cobertura ante morosos (premium) | ~Bs 50K/año |

### 5.2 Pricing

| Plan | Precio | Incluye |
|------|:------:|---------|
| **Gratis** | Bs 0 | 2 pasanakus activos, hasta 10 participantes, recordatorios básicos |
| **Pro** | Bs 15/mes | Ilimitados, hasta 30 participantes, analytics, badges exclusivos, soporte prioritario |
| **Business** | Bs 99/mes | White-label, API, reportes avanzados, un organizador + ilimitados participantes |
| **Enterprise** | Personalizado | Multi-organizador, integración nómina, SLA, soporte dedicado |

### 5.3 Métricas Clave (KPIs)

| Métrica | Definición | Meta Año 1 |
|---------|-----------|:----------:|
| **MAU** | Usuarios activos mensuales | 50,000 |
| **Pasanakus activos** | Grupos con ciclo en curso | 5,000 |
| **Tasa de pago puntual** | % pagos a tiempo | >85% |
| **Retención D30** | % usuarios que vuelven en 30 días | >60% |
| **Conversión Free→Pro** | % que upgradean | >5% |
| **NPS** | Net Promoter Score | >50 |
| **Tasa de completitud** | % pasanakus que llegan al final | >90% |

---

## 6. Arquitectura Técnica

### 6.1 Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend Mobile** | React Native (Expo) | Cross-platform (Android 90% del mercado BO), hot reload, código compartido |
| **Frontend Web** | Next.js 14 (App Router) | Landing, dashboard web, admin panel |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime + Storage) | Rápido de implementar, RLS, real-time, gratis al inicio |
| **Pagos** | QR Simple API + Tigo Money API | Estándar boliviano, alta adopción |
| **Notificaciones** | OneSignal (push) + WhatsApp Business API | Push + WhatsApp = canales dominantes en Bolivia |
| **SMS OTP** | Twilio / proveedor local | Auth por celular sin contraseña |
| **Analytics** | Mixpanel / PostHog (self-hosted) | Eventos, funnels, retención |
| **Hosting** | Vercel (web) + Expo EAS (mobile builds) | Vercel gratis al inicio, EAS para builds |
| **CI/CD** | GitHub Actions | Automatización estándar |

### 6.2 Esquema de Base de Datos (Core)

```sql
-- ============================================
-- USUARIOS
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,        -- +591 76543210
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  city TEXT,                          -- Cochabamba, La Paz, Santa Cruz, etc.
  ci_number TEXT,                     -- Cédula de identidad (opcional)
  ci_verified BOOLEAN DEFAULT FALSE,
  
  -- Reputación
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  total_pasanakus_completed INTEGER DEFAULT 0,
  total_on_time_payments INTEGER DEFAULT 0,
  total_late_payments INTEGER DEFAULT 0,
  
  -- Configuración
  notification_whatsapp BOOLEAN DEFAULT TRUE,
  notification_push BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'es',
  
  -- Suscripción
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'enterprise')),
  plan_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASANAKUS (Grupos)
-- ============================================
CREATE TABLE pasanakus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organizador
  organizer_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Información básica
  name TEXT NOT NULL,                  -- "Pasanaku Navideño 2026"
  description TEXT,
  image_url TEXT,
  
  -- Configuración financiera
  contribution_amount NUMERIC(10,2) NOT NULL,  -- Monto por persona por ciclo
  currency TEXT DEFAULT 'BOB',                  -- BOB = Bolivianos
  
  -- Configuración temporal
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  start_date DATE NOT NULL,
  
  -- Configuración de participantes
  max_participants INTEGER NOT NULL CHECK (max_participants >= 3 AND max_participants <= 30),
  
  -- Configuración de turnos
  turn_selection TEXT NOT NULL CHECK (turn_selection IN ('lottery', 'agreement', 'auction', 'fixed')),
  turns_assigned BOOLEAN DEFAULT FALSE,
  
  -- Reglas
  late_payment_grace_days INTEGER DEFAULT 3,    -- Días de gracia
  late_payment_penalty_percent NUMERIC(5,2) DEFAULT 0, -- % de penalización
  allow_turn_swap BOOLEAN DEFAULT TRUE,
  require_payment_proof BOOLEAN DEFAULT TRUE,
  
  -- Estado
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',        -- Creado pero no iniciado
    'recruiting',   -- Buscando participantes
    'ready',        -- Todos confirmados, por iniciar
    'active',       -- En curso
    'paused',       -- Pausado temporalmente
    'completed',    -- Terminado exitosamente
    'cancelled',    -- Cancelado
    'defaulted'     -- Fallido por morosidad
  )),
  
  -- Visibilidad
  is_public BOOLEAN DEFAULT FALSE,    -- Visible en explorador
  invite_code TEXT UNIQUE,            -- Código de invitación
  
  -- Categoría
  category TEXT CHECK (category IN (
    'general', 'navideño', 'escolar', 'viaje', 'negocio', 
    'electrodoméstico', 'vehículo', 'salud', 'otro'
  )),
  
  -- Conteo derivado
  current_cycle INTEGER DEFAULT 0,    -- Ciclo actual (1, 2, 3, ...)
  total_cycles INTEGER,               -- = max_participants
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MIEMBROS DEL PASANAKU
-- ============================================
CREATE TABLE pasanaku_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pasanaku_id UUID NOT NULL REFERENCES pasanakus(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Rol
  role TEXT DEFAULT 'participant' CHECK (role IN ('organizer', 'participant')),
  
  -- Turno
  turn_number INTEGER,                 -- Número de turno asignado (1, 2, 3, ...)
  turn_received BOOLEAN DEFAULT FALSE, -- Ya recibió el pozo
  turn_received_at TIMESTAMPTZ,
  
  -- Estado
  status TEXT DEFAULT 'invited' CHECK (status IN (
    'invited',     -- Invitado, pendiente de aceptar
    'confirmed',   -- Confirmó participación
    'active',      -- Participando activamente
    'defaulted',   -- Moroso (no pagó)
    'removed',     -- Removido por organizador
    'left'         -- Se fue voluntariamente
  )),
  
  -- Estadísticas dentro de este pasanaku
  total_paid NUMERIC(10,2) DEFAULT 0,
  total_received NUMERIC(10,2) DEFAULT 0,
  on_time_payments INTEGER DEFAULT 0,
  late_payments INTEGER DEFAULT 0,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(pasanaku_id, user_id)
);

-- ============================================
-- CICLOS (Rondas de pago)
-- ============================================
CREATE TABLE pasanaku_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pasanaku_id UUID NOT NULL REFERENCES pasanakus(id) ON DELETE CASCADE,
  
  cycle_number INTEGER NOT NULL,       -- 1, 2, 3, ...
  
  -- Quién recibe este ciclo
  recipient_id UUID REFERENCES profiles(id),
  
  -- Fechas
  due_date DATE NOT NULL,             -- Fecha límite de pago
  grace_deadline DATE,                -- Fecha límite con gracia
  
  -- Montos
  expected_total NUMERIC(10,2),       -- Monto esperado total del pozo
  actual_total NUMERIC(10,2) DEFAULT 0, -- Monto realmente recaudado
  
  -- Estado
  status TEXT DEFAULT 'upcoming' CHECK (status IN (
    'upcoming',    -- Próximo
    'collecting',  -- En período de cobro
    'distributing',-- Cobrado, distribuyendo al receptor
    'completed',   -- Receptor recibió el pozo
    'partial',     -- Completado pero con pagos faltantes
    'failed'       -- No se pudo completar
  )),
  
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAGOS
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pasanaku_id UUID NOT NULL REFERENCES pasanakus(id),
  cycle_id UUID NOT NULL REFERENCES pasanaku_cycles(id),
  payer_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Monto
  amount NUMERIC(10,2) NOT NULL,
  penalty_amount NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'BOB',
  
  -- Método de pago
  payment_method TEXT CHECK (payment_method IN (
    'cash',           -- Efectivo (registro manual)
    'bank_transfer',  -- Transferencia bancaria
    'qr_simple',      -- QR Simple (sistema boliviano)
    'tigo_money',     -- Billetera Tigo Money
    'in_app'          -- Pago dentro de la app (futuro)
  )),
  
  -- Comprobante
  proof_image_url TEXT,               -- Foto del comprobante
  proof_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  
  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',     -- Registrado, pendiente de verificación
    'verified',    -- Verificado por organizador
    'rejected',    -- Rechazado (comprobante inválido)
    'late',        -- Pagado tarde
    'missing'      -- No pagó (generado automáticamente)
  )),
  
  -- Timing
  paid_at TIMESTAMPTZ,
  was_on_time BOOLEAN,
  days_late INTEGER DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SORTEOS
-- ============================================
CREATE TABLE turn_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pasanaku_id UUID NOT NULL REFERENCES pasanakus(id) ON DELETE CASCADE,
  
  -- Resultado del sorteo
  results JSONB NOT NULL,             -- [{ user_id, turn_number, drawn_at }]
  
  -- Método
  method TEXT DEFAULT 'random' CHECK (method IN ('random', 'manual', 'auction')),
  
  -- Verificación
  seed TEXT,                          -- Seed del random para verificación
  
  performed_by UUID REFERENCES profiles(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Todos los participantes vieron el resultado
  acknowledged_by JSONB DEFAULT '[]'  -- [{ user_id, acknowledged_at }]
);

-- ============================================
-- CHAT / MENSAJES
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pasanaku_id UUID NOT NULL REFERENCES pasanakus(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'system', 'payment_notification')),
  
  -- Mensajes del sistema (automáticos)
  system_event TEXT,                  -- 'payment_received', 'turn_assigned', 'reminder', etc.
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BADGES / LOGROS
-- ============================================
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    'first_pasanaku',        -- Completó su primer pasanaku
    'puntual_5',             -- 5 pagos puntuales seguidos
    'puntual_10',            -- 10 pagos puntuales seguidos
    'puntual_25',            -- 25 pagos puntuales seguidos
    'organizer_star',        -- Organizó 3+ pasanakus sin problemas
    'trusted_member',        -- Trust score > 80
    'veteran',               -- 10+ pasanakus completados
    'perfect_record',        -- Nunca un pago tarde
    'community_builder',     -- Invitó 10+ personas
    'early_adopter'          -- Se registró en el primer mes
  )),
  
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- ============================================
-- NOTIFICACIONES
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  type TEXT NOT NULL CHECK (type IN (
    'payment_reminder',       -- Recordatorio de pago
    'payment_received',       -- Alguien pagó
    'payment_verified',       -- Tu pago fue verificado
    'turn_assigned',          -- Te tocó turno
    'turn_coming',            -- Tu turno se acerca
    'money_received',         -- Recibiste el pozo
    'member_joined',          -- Alguien se unió
    'member_defaulted',       -- Alguien es moroso
    'pasanaku_started',       -- El pasanaku inició
    'pasanaku_completed',     -- El pasanaku terminó
    'badge_earned',           -- Ganaste un badge
    'invite_received'         -- Te invitaron a un pasanaku
  )),
  
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Referencia
  pasanaku_id UUID REFERENCES pasanakus(id),
  action_url TEXT,
  
  -- Estado
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Canales enviados
  sent_push BOOLEAN DEFAULT FALSE,
  sent_whatsapp BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REPORTES / DENUNCIAS
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  pasanaku_id UUID REFERENCES pasanakus(id),
  
  reason TEXT NOT NULL CHECK (reason IN (
    'fraud',        -- Fraude
    'non_payment',  -- No pagó
    'harassment',   -- Acoso
    'fake_proof',   -- Comprobante falso
    'other'
  )),
  
  description TEXT,
  evidence_urls TEXT[],
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  resolution TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_pasanakus_organizer ON pasanakus(organizer_id);
CREATE INDEX idx_pasanakus_status ON pasanakus(status);
CREATE INDEX idx_pasanakus_public ON pasanakus(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_pasanaku_members_user ON pasanaku_members(user_id);
CREATE INDEX idx_pasanaku_members_pasanaku ON pasanaku_members(pasanaku_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_cycle ON payments(cycle_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_messages_pasanaku ON messages(pasanaku_id, created_at);
```

### 6.3 Row Level Security (RLS)

```sql
-- Profiles: ver cualquiera, editar solo el propio
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Pasanakus: ver si eres miembro o es público
CREATE POLICY "View pasanaku" ON pasanakus FOR SELECT USING (
  is_public = TRUE 
  OR organizer_id = auth.uid()
  OR id IN (SELECT pasanaku_id FROM pasanaku_members WHERE user_id = auth.uid())
);

-- Solo organizador puede editar
CREATE POLICY "Organizer manages" ON pasanakus FOR UPDATE USING (organizer_id = auth.uid());

-- Pagos: ver si eres miembro del pasanaku
CREATE POLICY "Members see payments" ON payments FOR SELECT USING (
  pasanaku_id IN (SELECT pasanaku_id FROM pasanaku_members WHERE user_id = auth.uid())
);

-- Notificaciones: solo las tuyas
CREATE POLICY "Own notifications" ON notifications FOR ALL USING (user_id = auth.uid());
```

---

## 7. Flujos de Usuario Principales

### 7.1 Flujo: Crear un Pasanaku

```
1. [Home] → Tap "Crear Pasanaku" (+)
2. [Crear] → Nombre: "Pasanaku de las comadres"
3. [Crear] → Monto: Bs 500 por persona
4. [Crear] → Frecuencia: Mensual
5. [Crear] → Participantes: 10
6. [Crear] → Inicio: 1 de marzo 2026
7. [Crear] → Turnos: Sorteo
8. [Crear] → Reglas: 3 días de gracia, sin penalización
9. [Confirmar] → Se crea el pasanaku en estado "recruiting"
10. [Invitar] → Compartir link por WhatsApp/SMS
11. [Esperar] → Los invitados aceptan
12. [Listo] → Cuando todos confirmaron → "ready"
13. [Sorteo] → El organizador inicia el sorteo digital
14. [Activo] → El pasanaku comienza
```

### 7.2 Flujo: Pagar un Ciclo

```
1. [Notificación] → "Tu pago de Bs 500 para 'Comadres' vence en 3 días"
2. [Home] → Ver pasanaku activo → "Pago pendiente: Bs 500"
3. [Pagar] → Seleccionar método: QR Simple
4. [Pagar] → Se muestra el QR del organizador/receptor
5. [Pagar] → El usuario paga con su app bancaria
6. [Comprobante] → Sube foto del comprobante
7. [Verificar] → El organizador recibe notificación
8. [Organizador] → Revisa y marca como "verificado" ✅
9. [Actualizar] → El sistema actualiza el estado del ciclo
10. [Grupo] → Mensaje automático: "Carlos pagó ✅ (8/10 pagos recibidos)"
```

### 7.3 Flujo: Recibir el Pozo

```
1. [Notificación] → "¡Es tu turno! Este mes recibes el pozo de Bs 5,000"
2. [Dashboard] → Status: "Turno #5 — Recibiendo"
3. [Ciclo] → Ver estado de cobros: 8/10 pagos confirmados
4. [Esperar] → Recordatorios automáticos a los 2 faltantes
5. [Completo] → 10/10 pagos verificados
6. [Transferencia] → El organizador transfiere Bs 5,000
7. [Confirmar] → El receptor confirma recepción
8. [Celebrar] → Animación de celebración + badge si aplica
9. [siguiente] → El ciclo avanza al turno #6
```

---

## 8. Diseño y Experiencia

### 8.1 Principios de Diseño

1. **Mobile-first absoluto**: 95% del uso será en celular
2. **Culturalmente relevante**: Colores cálidos, iconografía andina sutil
3. **Simple para todos**: Doña Martha de 55 años debe poder usarla
4. **Confianza visual**: Transparencia, verificaciones, sellos de seguridad
5. **Celebratorio**: Animaciones al recibir el pozo, badges, confetti

### 8.2 Paleta de Colores

```css
:root {
  /* Primario — Verde esmeralda (prosperidad, dinero, confianza) */
  --primary-500: hsl(155, 70%, 40%);
  --primary-600: hsl(155, 75%, 32%);
  --primary-400: hsl(155, 65%, 50%);
  
  /* Secundario — Dorado andino (tradición, valor) */
  --secondary-500: hsl(40, 85%, 55%);
  --secondary-600: hsl(40, 90%, 45%);
  
  /* Acento — Naranja cálido (acción, energía) */
  --accent-500: hsl(25, 90%, 55%);
  
  /* Neutrales */
  --bg-primary: hsl(150, 10%, 97%);
  --surface: hsl(0, 0%, 100%);
  --text-primary: hsl(220, 20%, 15%);
  --text-secondary: hsl(220, 10%, 45%);
  
  /* Semánticos */
  --success: hsl(145, 60%, 45%);  /* Pago confirmado */
  --warning: hsl(35, 90%, 55%);   /* Pago pendiente */
  --error: hsl(0, 70%, 55%);      /* Moroso */
}
```

### 8.3 Tipografía

```css
/* Fuente principal: legible, moderna, con soporte completo de español */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

:root {
  --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace; /* Para montos */
}
```

---

## 9. Estrategia de Lanzamiento

### 9.1 Fases

| Fase | Periodo | Meta | Acciones |
|------|---------|------|----------|
| **Alpha** | Mes 1-2 | 100 usuarios, 10 pasanakus | Amigos, familia, early adopters internos |
| **Beta cerrada** | Mes 3-4 | 1,000 usuarios, 100 pasanakus | Invitación por referido, feedback intensivo |
| **Beta abierta** | Mes 5-6 | 10,000 usuarios | Play Store, marketing orgánico, ferias |
| **Lanzamiento** | Mes 7 | 25,000 usuarios | PR, influencers bolivianos, partnerships |
| **Crecimiento** | Mes 8-12 | 50,000 usuarios | Paid ads, referidos, B2B partnerships |

### 9.2 Canales de Marketing

1. **WhatsApp viral**: Link de invitación + "Invita 3 amigos y gana Pro gratis por 1 mes"
2. **Ferias y mercados**: Demo en persona donde la gente ya hace pasanakus
3. **Influencers bolivianos**: Tiktokers, YouTubers locales
4. **Alianzas**: Cooperativas, asociaciones de comerciantes, sindicatos
5. **SEO local**: "pasanaku app", "pasanaku digital Bolivia"
6. **Facebook Groups**: Comunidades de ahorro bolivianas

### 9.3 Go-To-Market Regional

```
Fase 1: Cochabamba (ciudad más activa en pasanakus)
Fase 2: Santa Cruz + La Paz
Fase 3: Ciudades intermedias (Sucre, Oruro, Tarija, Potosí)
Fase 4: Perú (Lima primero)
Fase 5: México (CDMX, Guadalajara)
```

---

## 10. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|:---:|:---:|------------|
| Usuarios no confían en app nueva | Alta | Crítico | Reputación visible, referidos de confianza, verificación de identidad |
| Fraude (organizador huye) | Media | Crítico | CI verificado, score de confianza, límites para nuevos organizadores, seguro |
| Usuario moroso abandona | Alta | Alto | Penalizaciones, score público negativo, lista de morosos |
| Baja adopción digital | Media | Alto | UX simple, onboarding en persona en ferias, WhatsApp como puente |
| Problemas legales (regulación financiera) | Media | Alto | Asesoría legal, NO tocar el dinero directamente, solo facilitar gestión |
| Competidor con más funding | Baja | Medio | Mejor UX, pagos integrados, moverse rápido, foco en Bolivia |

### 10.1 Nota Legal Importante

> PasanakuYa **NO es una entidad financiera**. No custodia ni transfiere dinero. La app es una **herramienta de gestión** que facilita la organización de pasanakus entre particulares. Los pagos se realizan directamente entre los participantes a través de canales bancarios existentes. Esto nos posiciona fuera de la regulación financiera de ASFI (Autoridad de Supervisión del Sistema Financiero).

---

## 11. Equipo Necesario

| Rol | Fase | Dedicación |
|-----|------|------------|
| **Product Manager** | Alpha | Full-time |
| **Full-Stack Developer** (React Native + Next.js) | Alpha | Full-time |
| **UI/UX Designer** | Alpha | Part-time → Full-time |
| **Backend/DevOps** | Beta | Part-time |
| **Community Manager** | Beta | Part-time |
| **Growth/Marketing** | Lanzamiento | Full-time |
| **Customer Support** | Lanzamiento | Part-time |

---

## 12. Definición de Éxito

### Año 1
- ✅ 50,000 MAU en Bolivia
- ✅ 5,000 pasanakus completados exitosamente
- ✅ Tasa de completitud >90%
- ✅ NPS >50
- ✅ Revenue: Bs 700K+ anuales
- ✅ Break-even operativo

### Año 2
- ✅ 200,000 MAU (Bolivia + Perú)
- ✅ Pagos integrados funcionando (QR Simple)
- ✅ Score crediticio lanzado
- ✅ 5 partnerships B2B activos
- ✅ Pre-seed o seed round completado

### Año 3
- ✅ 1M+ MAU (3 países)
- ✅ Servicios financieros lanzados (microcréditos)
- ✅ Revenue: $500K+ USD anuales
- ✅ Serie A

---

*Este documento es un artefacto vivo. Se actualiza conforme evoluciona el producto.*
