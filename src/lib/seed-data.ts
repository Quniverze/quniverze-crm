import { User, Lead, Opportunity, FollowUp, Activity, Client, Project } from '@/types/crm';

export const SEED_USERS: User[] = [
  {
    id: 'usr_founder',
    name: 'Faslu (Founder)',
    role: 'founder',
    email: 'founder@quniverze.com',
    phone: '+91 98950 12345'
  },
  {
    id: 'usr_outreach',
    name: 'Adil (Outreach Executive)',
    role: 'outreach',
    email: 'outreach@quniverze.com',
    phone: '+91 98950 67890'
  }
];

const now = new Date();
const dateOffset = (days: number, hours = 0): string => {
  const d = new Date(now.getTime() + days * 86400000 + hours * 3600000);
  return d.toISOString();
};

export const SEED_LEADS: Lead[] = [
  // 1. DEMO SCENARIO: ABC RESTAURANT (Section 35)
  {
    id: 'lead_abc_restaurant',
    business_name: 'ABC Restaurant',
    contact_name: 'David Chen',
    phone: '+91 94471 23456',
    whatsapp: '+91 94471 23456',
    email: 'david@abcrestaurant.com',
    website: 'abcrestaurant.in',
    instagram: '@abcrestaurant_clt',
    industry: 'Restaurant',
    location: 'Kozhikode',
    lead_source: 'Instagram Audit',
    status: 'Proposal',
    assigned_to: 'usr_founder',
    description: 'High-volume dining venue with 120 covers. Website needs modern revamp with online menu ordering and table reservations.',
    observation: 'Outdated static website. Active Instagram with 14K followers. No online ordering or QR menu system.',
    notes: 'David is very enthusiastic about upgrading their website to capture corporate lunch catering orders.',
    last_contact_at: dateOffset(-1),
    next_follow_up_at: dateOffset(0, 4), // Due today
    created_at: dateOffset(-7),
    updated_at: dateOffset(-1)
  },

  // 2. MALABAR INTERIORS
  {
    id: 'lead_malabar_interiors',
    business_name: 'Malabar Interiors',
    contact_name: 'Arjun Nambiar',
    phone: '+91 98460 77123',
    whatsapp: '+91 98460 77123',
    email: 'arjun@malabarinteriors.com',
    website: 'malabarinteriors.com',
    instagram: '@malabar_interiors_co',
    industry: 'Interior Design',
    location: 'Kozhikode',
    lead_source: 'Google Maps Audit',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: 'Premium residential interior architectural firm. Strong portfolio of luxury villas in Wayanad and Calicut.',
    observation: 'No modern website. Relying exclusively on Instagram DM inquiries. High deal size potential.',
    notes: 'Prime candidate for portfolio showcase site with 3D walkthrough embeddings.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-3),
    updated_at: dateOffset(-3)
  },

  // 3. NOVA DENTAL STUDIO
  {
    id: 'lead_nova_dental',
    business_name: 'Nova Dental Studio',
    contact_name: 'Dr. Rehana Thomas',
    phone: '+91 97455 33210',
    whatsapp: '+91 97455 33210',
    email: 'contact@novadentalstudio.in',
    website: 'novadentalstudio.in',
    instagram: '@novadental_clt',
    industry: 'Healthcare',
    location: 'Kozhikode',
    lead_source: 'Practo Referral',
    status: 'Meeting',
    assigned_to: 'usr_founder',
    description: 'Boutique cosmetic dental and implant clinic in Mavoor Road. Expanding to second clinic in Edappal.',
    observation: 'Current site non-responsive on mobile phones. Appointment booking button broken.',
    notes: 'Meeting scheduled with Dr. Rehana to demo web appointment scheduler.',
    last_contact_at: dateOffset(-2),
    next_follow_up_at: dateOffset(1), // Tomorrow
    created_at: dateOffset(-6),
    updated_at: dateOffset(-2)
  },

  // 4. XYZ CAFÉ
  {
    id: 'lead_xyz_cafe',
    business_name: 'XYZ Café & Roastery',
    contact_name: 'Sarah Lin',
    phone: '+91 99951 88442',
    whatsapp: '+91 99951 88442',
    email: 'sarah@xyzcafe.in',
    website: 'xyzcafe.in',
    instagram: '@xyzroasters',
    industry: 'Café',
    location: 'Kozhikode',
    lead_source: 'Walk-in Research',
    status: 'Negotiation',
    assigned_to: 'usr_founder',
    description: 'Specialty coffee roastery and café chain with 2 locations. Looking for e-commerce coffee bean subscriptions.',
    observation: 'Proposal delivered 4 days ago. Tier-2 pricing and customized POS integration plan submitted.',
    notes: 'Follow up on payment terms; requested 50% advance instead of 70%.',
    last_contact_at: dateOffset(-4),
    next_follow_up_at: dateOffset(-1), // Overdue by 1 day!
    created_at: dateOffset(-12),
    updated_at: dateOffset(-4)
  },

  // 5. SPICE ROUTE HERITAGE RESORT
  {
    id: 'lead_spice_route',
    business_name: 'Spice Route Heritage Resort',
    contact_name: 'Mohamed Riyas',
    phone: '+91 94477 99011',
    whatsapp: '+91 94477 99011',
    email: 'gm@spicerouteresort.com',
    website: 'spicerouteresort.com',
    instagram: '@spiceroute_resort',
    industry: 'Hotels',
    location: 'Wayanad',
    lead_source: 'TripAdvisor Direct',
    status: 'Qualified',
    assigned_to: 'usr_founder',
    description: '28-key luxury plantation resort with Ayurveda spa. Currently paying 18% OTA commission to MakeMyTrip.',
    observation: 'Website direct booking engine absent. Slow page load (6.4s). Huge ROI potential for direct booking engine.',
    notes: 'Founder call required to pitch direct booking engine savings model.',
    last_contact_at: dateOffset(-2),
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-5),
    updated_at: dateOffset(-2)
  },

  // 6. LUEUR LUXURY SALON
  {
    id: 'lead_lueur_salon',
    business_name: 'Lueur Luxury Salon & Spa',
    contact_name: 'Pooja Menon',
    phone: '+91 98472 11990',
    whatsapp: '+91 98472 11990',
    email: 'info@lueursalon.com',
    website: 'lueursalon.com',
    instagram: '@lueursalon_calicut',
    industry: 'Salons',
    location: 'Kozhikode',
    lead_source: 'Instagram Audit',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: 'High-end bridal and skin aesthetics studio on PT Usha Road. Active bridal influencer tie-ups.',
    observation: 'Website domain expired last month. Replaced by generic registrar parking page.',
    notes: 'High urgency — business is currently losing organic search inquiries.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-2),
    updated_at: dateOffset(-2)
  },

  // 7. CALICUT PRIME PROPERTIES
  {
    id: 'lead_calicut_prime',
    business_name: 'Calicut Prime Real Estate',
    contact_name: 'K.V. Abdul Latheef',
    phone: '+91 94460 55432',
    whatsapp: '+91 94460 55432',
    email: 'latheef@calicutprime.com',
    website: 'calicutprime.com',
    instagram: '@calicutprime_realty',
    industry: 'Real Estate',
    location: 'Kozhikode',
    lead_source: 'Newspaper Ad Research',
    status: 'Interested',
    assigned_to: 'usr_founder',
    description: 'Premium apartment builder with 4 ongoing projects across Beach Road and Chelavoor.',
    observation: 'Outdated project landing pages. No virtual brochure downloads or WhatsApp lead capture bots.',
    notes: 'Outreach called managing partner; requested founder presentation on Tuesday.',
    last_contact_at: dateOffset(-1),
    next_follow_up_at: dateOffset(2),
    created_at: dateOffset(-4),
    updated_at: dateOffset(-1)
  },

  // 8. HERITAGE SILKS & SAREES
  {
    id: 'lead_heritage_silks',
    business_name: 'Heritage Silks & Sarees',
    contact_name: 'M. Balakrishnan',
    phone: '+91 98461 44556',
    whatsapp: '+91 98461 44556',
    email: 'mb@heritagesilks.in',
    website: 'heritagesilks.in',
    instagram: '@heritagesilks_kerala',
    industry: 'Retail',
    location: 'Kozhikode',
    lead_source: 'SM Street Directory',
    status: 'Contacted',
    assigned_to: 'usr_outreach',
    description: '30-year legacy wedding silk retail showroom on SM Street. Wants to launch NRI diaspora gift deliveries.',
    observation: 'No catalog website. Instagram DM sales currently handled manually on phone.',
    notes: 'Spoke with son Vinod; requested WhatsApp pitch deck.',
    last_contact_at: dateOffset(-2),
    next_follow_up_at: dateOffset(1),
    created_at: dateOffset(-5),
    updated_at: dateOffset(-2)
  },

  // 9. STUDIO VISTAS ARCHITECTS
  {
    id: 'lead_studio_vistas',
    business_name: 'Studio Vistas Architects',
    contact_name: 'Fahad Basheer',
    phone: '+91 99462 88123',
    whatsapp: '+91 99462 88123',
    email: 'fahad@studiovistas.net',
    website: 'studiovistas.net',
    instagram: '@studiovistas_arch',
    industry: 'Interior Design',
    location: 'Kochi',
    lead_source: 'Design Index',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: 'Sustainable tropical residential architecture studio. Featured in Architectural Digest India.',
    observation: 'Website is on generic Wix template with broken image anchors and slow load.',
    notes: 'Target custom Next.js portfolio with minimalist editorial layout.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1)
  },

  // 10. APEX CHARTERED ACCOUNTANTS
  {
    id: 'lead_apex_ca',
    business_name: 'Apex Tax & Audit Associates',
    contact_name: 'CA George Mathew',
    phone: '+91 94470 11223',
    whatsapp: '+91 94470 11223',
    email: 'george@apexassociates.in',
    website: 'apexassociates.in',
    instagram: '',
    industry: 'Professional Services',
    location: 'Kochi',
    lead_source: 'LinkedIn Directory',
    status: 'New',
    assigned_to: 'usr_outreach',
    description: 'Corporate audit and GCC tax compliance firm serving export houses.',
    observation: 'No web presence other than JustDial listing. Needs professional credibility website.',
    notes: 'Verify corporate office direct extension.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(1),
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1)
  },

  // 11. URBAN TREND APPAREL
  {
    id: 'lead_urban_trend',
    business_name: 'Urban Trend Streetwear',
    contact_name: 'Adithya Ramesh',
    phone: '+91 98479 66778',
    whatsapp: '+91 98479 66778',
    email: 'hello@urbantrend.in',
    website: 'urbantrend.in',
    instagram: '@urbantrend_india',
    industry: 'Retail',
    location: 'Bangalore',
    lead_source: 'Instagram Audit',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: 'DTC oversize streetwear label with 45K followers. Struggling with Shopify cart abandonment.',
    observation: 'High checkout friction, slow mobile rendering. High potential for custom headless Shopify.',
    notes: 'Outreach to founder Adithya via phone.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-2),
    updated_at: dateOffset(-2)
  },

  // 12. MALABAR GOLD TRADERS
  {
    id: 'lead_malabar_gold',
    business_name: 'Malabar Heritage Jewellers',
    contact_name: 'Hameed Haji',
    phone: '+91 94461 22334',
    whatsapp: '+91 94461 22334',
    email: 'hameed@malabarheritagegold.com',
    website: 'malabarheritagegold.com',
    instagram: '@malabarheritagejewels',
    industry: 'Retail',
    location: 'Kozhikode',
    lead_source: 'Direct Network',
    status: 'Won',
    assigned_to: 'usr_founder',
    description: 'Traditional handcrafted wedding jewelry house with 3 showrooms.',
    observation: 'Custom catalog portal with gold rate ticker developed and deployed.',
    notes: 'Successfully closed and delivered. Client converted to ongoing maintenance retainer.',
    last_contact_at: dateOffset(-10),
    next_follow_up_at: undefined,
    created_at: dateOffset(-30),
    updated_at: dateOffset(-10)
  },

  // 13. CROWN BARBERSHOP
  {
    id: 'lead_crown_barber',
    business_name: 'Crown Heritage Barber Co.',
    contact_name: 'Zameer Khan',
    phone: '+91 99460 33445',
    whatsapp: '+91 99460 33445',
    email: 'zameer@crownbarber.in',
    website: 'crownbarber.in',
    instagram: '@crownbarber_clt',
    industry: 'Salons',
    location: 'Kozhikode',
    lead_source: 'Local Search',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: 'Gentlemen grooming parlour in Hilite Mall area. High appointment volume on weekends.',
    observation: 'Uses manual paper register for queue management. Customers wait 45+ mins.',
    notes: 'Pitch quick SMS/WhatsApp booking queue page.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-3),
    updated_at: dateOffset(-3)
  },

  // 14. VERTEX COLD LOGISTICS
  {
    id: 'lead_vertex_logistics',
    business_name: 'Vertex Cold Chain & Freight',
    contact_name: 'K. Rajeev',
    phone: '+91 94473 88990',
    whatsapp: '+91 94473 88990',
    email: 'rajeev@vertexfreight.com',
    website: 'vertexfreight.com',
    instagram: '',
    industry: 'Professional Services',
    location: 'Kochi',
    lead_source: 'Port Terminal Directory',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: 'Refrigerated container trucking fleet operating out of Cochin Port.',
    observation: 'Basic static brochure website. No live consignment tracking portal for seafood exporters.',
    notes: 'Opportunity for custom client tracking portal.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-2),
    updated_at: dateOffset(-2)
  },

  // 15. CALICUT BEACH BISTRO
  {
    id: 'lead_beach_bistro',
    business_name: 'Calicut Beach Bistro',
    contact_name: 'Anil Kumar',
    phone: '+91 98463 99887',
    whatsapp: '+91 98463 99887',
    email: 'anil@calicutbeachbistro.com',
    website: 'calicutbeachbistro.com',
    instagram: '@beachbistro_clt',
    industry: 'Restaurant',
    location: 'Kozhikode',
    lead_source: 'Google Maps Audit',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: 'Sea-facing café & continental kitchen with heavy tourist weekend traffic.',
    observation: 'Website shows "Under Construction" for last 6 months. High Google review volume (4.6 stars, 1200 reviews).',
    notes: 'Call manager to pitch fast 5-page responsive launch.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-2),
    updated_at: dateOffset(-2)
  },

  // 16. WAYANAD MIST RETREAT
  {
    id: 'lead_wayanad_mist',
    business_name: 'Wayanad Mist Plantation Stay',
    contact_name: 'Dr. Kurien Varghese',
    phone: '+91 94474 11234',
    whatsapp: '+91 94474 11234',
    email: 'info@wayanadmist.in',
    website: 'wayanadmist.in',
    instagram: '@wayanadmist_official',
    industry: 'Hotels',
    location: 'Wayanad',
    lead_source: 'Airbnb Cross-Check',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: 'High-end eco-villas amidst 40-acre tea estate in Meppadi.',
    observation: 'Only listed on Airbnb. No direct brand website; losing 15% booking fees.',
    notes: 'High propensity to pay for direct booking luxury engine.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1)
  },

  // 17. PRESTIGE DENTAL CLINIC
  {
    id: 'lead_prestige_dental',
    business_name: 'Prestige Multi-Specialty Dental',
    contact_name: 'Dr. Najeeb Rahman',
    phone: '+91 98471 66554',
    whatsapp: '+91 98471 66554',
    email: 'drnajeeb@prestigesmile.com',
    website: 'prestigesmile.com',
    instagram: '@prestigedental_kerala',
    industry: 'Healthcare',
    location: 'Kozhikode',
    lead_source: 'Practo Audit',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: '4-chair multispeciality dental surgical clinic.',
    observation: 'SSL certificate expired. Chrome marks site as "Not Secure".',
    notes: 'Urgent security and credibility revamp pitch.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1)
  },

  // 18. KOZHIKODE ROASTERY HUB
  {
    id: 'lead_kozhikode_roastery',
    business_name: 'Roast & Bean Roastery',
    contact_name: 'Nikhil Chandran',
    phone: '+91 99950 44332',
    whatsapp: '+91 99950 44332',
    email: 'nikhil@roastandbean.in',
    website: 'roastandbean.in',
    instagram: '@roastandbean_clt',
    industry: 'Café',
    location: 'Kozhikode',
    lead_source: 'Instagram Audit',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: 'Artisanal micro-roastery supplying wholesale coffee beans to local cafés.',
    observation: 'No wholesale B2B ordering portal. Bulk orders taken over fragmented WhatsApp chats.',
    notes: 'Pitch wholesale ordering portal.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1)
  },

  // 19. WOODLINE CONCEPTS
  {
    id: 'lead_woodline_concepts',
    business_name: 'Woodline Modular Kitchens',
    contact_name: 'Suresh Babu',
    phone: '+91 94463 11889',
    whatsapp: '+91 94463 11889',
    email: 'suresh@woodlineconcepts.in',
    website: 'woodlineconcepts.in',
    instagram: '@woodline_kitchens',
    industry: 'Interior Design',
    location: 'Kozhikode',
    lead_source: 'Exhibition Directory',
    status: 'Lost',
    assigned_to: 'usr_outreach',
    description: 'Modular kitchen and wardrobe manufacturer.',
    observation: 'Spoke with owner; currently in internal restructuring, deferred web project to next fiscal year.',
    notes: 'Revisit in Q1 next year.',
    last_contact_at: dateOffset(-14),
    next_follow_up_at: undefined,
    created_at: dateOffset(-20),
    updated_at: dateOffset(-14)
  },

  // 20. BREAD & BUTTER BAKERY
  {
    id: 'lead_bread_butter',
    business_name: 'Bread & Butter Artisan Bakers',
    contact_name: 'Deepa Joseph',
    phone: '+91 98475 22110',
    whatsapp: '+91 98475 22110',
    email: 'deepa@breadandbutter.co.in',
    website: 'breadandbutter.co.in',
    instagram: '@breadandbutter_bakes',
    industry: 'Restaurant',
    location: 'Kozhikode',
    lead_source: 'Instagram Audit',
    status: 'To Call',
    assigned_to: 'usr_outreach',
    description: 'European sourdough bakery and dessert bar.',
    observation: 'Takes custom wedding cake orders manually. Needs online booking calendar with deposit gateway.',
    notes: 'Call Deepa for cake ordering portal pitch.',
    last_contact_at: undefined,
    next_follow_up_at: dateOffset(0),
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1)
  }
];

export const SEED_OPPORTUNITIES: Opportunity[] = [
  // 1. ABC Restaurant (Section 35 Demo Scenario)
  {
    id: 'opp_abc_restaurant',
    lead_id: 'lead_abc_restaurant',
    estimated_value: 35000,
    probability: 80,
    stage: 'Proposal',
    assigned_to: 'usr_founder',
    next_action: 'Follow up on proposal terms with David Chen',
    next_follow_up_at: dateOffset(0, 4), // Due today
    notes: 'Custom responsive web design, digital menu, table reservation integration, and local SEO setup.',
    created_at: dateOffset(-5),
    updated_at: dateOffset(-1)
  },

  // 2. Nova Dental Studio
  {
    id: 'opp_nova_dental',
    lead_id: 'lead_nova_dental',
    estimated_value: 30000,
    probability: 60,
    stage: 'Discovery',
    assigned_to: 'usr_founder',
    next_action: 'Zoom demo with Dr. Rehana Thomas',
    next_follow_up_at: dateOffset(1), // Tomorrow
    notes: 'Full aesthetic clinic website with patient appointment booking and doctor profiles.',
    created_at: dateOffset(-4),
    updated_at: dateOffset(-2)
  },

  // 3. XYZ Café & Roastery
  {
    id: 'opp_xyz_cafe',
    lead_id: 'lead_xyz_cafe',
    estimated_value: 45000,
    probability: 70,
    stage: 'Negotiation',
    assigned_to: 'usr_founder',
    next_action: 'Close contract on 50% advance agreement',
    next_follow_up_at: dateOffset(-1), // Overdue by 1 day!
    notes: 'Brand website with headless subscription e-commerce for roasted coffee beans.',
    created_at: dateOffset(-8),
    updated_at: dateOffset(-4)
  },

  // 4. Spice Route Resort
  {
    id: 'opp_spice_route',
    lead_id: 'lead_spice_route',
    estimated_value: 65000,
    probability: 50,
    stage: 'Qualified',
    assigned_to: 'usr_founder',
    next_action: 'Founder discovery call with General Manager Riyas',
    next_follow_up_at: dateOffset(0), // Due today
    notes: 'Luxury resort web experience with commission-free direct booking engine.',
    created_at: dateOffset(-2),
    updated_at: dateOffset(-2)
  },

  // 5. Calicut Prime Properties
  {
    id: 'opp_calicut_prime',
    lead_id: 'lead_calicut_prime',
    estimated_value: 55000,
    probability: 40,
    stage: 'Qualified',
    assigned_to: 'usr_founder',
    next_action: 'Prepare apartment portfolio presentation',
    next_follow_up_at: dateOffset(2),
    notes: 'Interactive floor-plan viewer, brochure capture, and WhatsApp integration.',
    created_at: dateOffset(-1),
    updated_at: dateOffset(-1)
  }
];

export const SEED_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'fu_abc_1',
    lead_id: 'lead_abc_restaurant',
    opportunity_id: 'opp_abc_restaurant',
    assigned_to: 'usr_founder',
    due_at: dateOffset(0, 4), // Today
    action: 'Call David Chen regarding proposal acceptance',
    status: 'pending',
    notes: 'Sent formal proposal 3 days ago. David indicated decision before Friday.',
    created_at: dateOffset(-3)
  },
  {
    id: 'fu_xyz_1',
    lead_id: 'lead_xyz_cafe',
    opportunity_id: 'opp_xyz_cafe',
    assigned_to: 'usr_founder',
    due_at: dateOffset(-1), // Overdue
    action: 'Finalize payment terms with Sarah Lin',
    status: 'pending',
    notes: 'Sarah requested split advance 50-50.',
    created_at: dateOffset(-4)
  },
  {
    id: 'fu_nova_1',
    lead_id: 'lead_nova_dental',
    opportunity_id: 'opp_nova_dental',
    assigned_to: 'usr_founder',
    due_at: dateOffset(1), // Tomorrow
    action: 'Product demo presentation with Dr. Rehana',
    status: 'pending',
    notes: 'Prepare calendar appointment module walkthrough.',
    created_at: dateOffset(-2)
  },
  {
    id: 'fu_heritage_silks',
    lead_id: 'lead_heritage_silks',
    assigned_to: 'usr_outreach',
    due_at: dateOffset(1),
    action: 'Send WhatsApp portfolio to Vinod Balakrishnan',
    status: 'pending',
    notes: 'Vinod asked for retail showroom case studies.',
    created_at: dateOffset(-1)
  }
];

export const SEED_ACTIVITIES: Activity[] = [
  // ABC Restaurant demo scenario timeline (Section 35)
  {
    id: 'act_abc_1',
    lead_id: 'lead_abc_restaurant',
    person_id: 'usr_outreach',
    type: 'created',
    body: 'Lead identified through Instagram audit of Kozhikode dining venues.',
    created_at: dateOffset(-7)
  },
  {
    id: 'act_abc_2',
    lead_id: 'lead_abc_restaurant',
    person_id: 'usr_outreach',
    type: 'called',
    body: 'Outreach call placed to owner David Chen (+91 94471 23456). Discussed lack of online ordering on existing site.',
    created_at: dateOffset(-6)
  },
  {
    id: 'act_abc_3',
    lead_id: 'lead_abc_restaurant',
    person_id: 'usr_outreach',
    type: 'outcome',
    body: 'Outcome logged: Interested. Client wants modern mobile ordering for lunch corporate clientele.',
    created_at: dateOffset(-6)
  },
  {
    id: 'act_abc_4',
    lead_id: 'lead_abc_restaurant',
    opportunity_id: 'opp_abc_restaurant',
    person_id: 'usr_outreach',
    type: 'stage_changed',
    body: 'Lead qualified and assigned to Founder (Faslu) for consultation and proposal.',
    created_at: dateOffset(-5)
  },
  {
    id: 'act_abc_5',
    lead_id: 'lead_abc_restaurant',
    opportunity_id: 'opp_abc_restaurant',
    person_id: 'usr_founder',
    type: 'meeting',
    body: 'Founder discovery session conducted at restaurant. Finalized scope: 6 pages, digital QR menu, reservation widget.',
    created_at: dateOffset(-4)
  },
  {
    id: 'act_abc_6',
    lead_id: 'lead_abc_restaurant',
    opportunity_id: 'opp_abc_restaurant',
    person_id: 'usr_founder',
    type: 'proposal',
    body: 'Commercial proposal delivered for ₹35,000 with 14-day turnaround guarantee.',
    created_at: dateOffset(-3)
  },

  // XYZ Café timeline
  {
    id: 'act_xyz_1',
    lead_id: 'lead_xyz_cafe',
    person_id: 'usr_outreach',
    type: 'called',
    body: 'Initial outreach call to Sarah Lin. Very responsive to e-commerce bean subscription pitch.',
    created_at: dateOffset(-10)
  },
  {
    id: 'act_xyz_2',
    lead_id: 'lead_xyz_cafe',
    opportunity_id: 'opp_xyz_cafe',
    person_id: 'usr_founder',
    type: 'proposal',
    body: 'Delivered ₹45,000 bespoke proposal including custom subscription checkout.',
    created_at: dateOffset(-4)
  },

  // Nova Dental timeline
  {
    id: 'act_nova_1',
    lead_id: 'lead_nova_dental',
    person_id: 'usr_outreach',
    type: 'called',
    body: 'Called clinic front desk; transferred to Dr. Rehana. Scheduled Zoom meeting.',
    created_at: dateOffset(-2)
  }
];

export const SEED_CLIENTS: Client[] = [
  {
    id: 'cli_malabar_gold',
    lead_id: 'lead_malabar_gold',
    business_name: 'Malabar Heritage Jewellers',
    contact_name: 'Hameed Haji',
    phone: '+91 94461 22334',
    email: 'hameed@malabarheritagegold.com',
    project: 'E-Catalog & Live Gold Rate Ticker Portal',
    value: 75000,
    status: 'active',
    notes: 'Delivered in 21 days. Client on quarterly maintenance retainer (₹8,000/mo).',
    created_at: dateOffset(-10),
    updated_at: dateOffset(-10)
  }
];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'prj_nivaops',
    name: 'NivaOps',
    category: 'product',
    tagline: 'Property management for modern operators',
    description: 'Internal SaaS product built and operated by Quniverze for property managers, automating billing, lease compliance, and guest experiences.',
    status: 'active',
    tech_stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind'],
    monthly_revenue: 120000,
    lead_owner: 'usr_founder',
    created_at: dateOffset(-60),
    updated_at: dateOffset(-1)
  },
  {
    id: 'prj_boven_frontier',
    name: 'Boven Frontier',
    category: 'client',
    tagline: 'Digital platform for global trade',
    description: 'Custom web application handling cross-border consignment manifests, rate calculation, and merchant clearance tracking.',
    status: 'active',
    tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind'],
    contract_value: 145000,
    lead_owner: 'usr_founder',
    created_at: dateOffset(-30),
    updated_at: dateOffset(-2)
  },
  {
    id: 'prj_igcc',
    name: 'IGCC',
    category: 'client',
    tagline: 'Web platform and digital presence',
    description: 'Bespoke corporate platform, membership directory, and interactive investor forum.',
    status: 'active',
    tech_stack: ['Next.js', 'TypeScript', 'Tailwind'],
    contract_value: 95000,
    lead_owner: 'usr_founder',
    created_at: dateOffset(-45),
    updated_at: dateOffset(-4)
  },
  {
    id: 'prj_stayb',
    name: 'StayB.',
    category: 'venture',
    tagline: 'Modern accommodation platform',
    description: 'Co-founded internal venture offering unified booking and operational management for boutique short-stay properties.',
    status: 'in_development',
    tech_stack: ['Next.js', 'Tailwind', 'Supabase'],
    monthly_revenue: 35000,
    lead_owner: 'usr_founder',
    created_at: dateOffset(-20),
    updated_at: dateOffset(-1)
  }
];

