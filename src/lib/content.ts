export type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  why: string;
  reassurance: string;
  timing?: string;
};

export type ChecklistCategory = {
  category: string;
  items: ChecklistItem[];
};

export type ChecklistPhase = {
  id: string;
  title: string;
  subtitle: string;
  categories: ChecklistCategory[];
};

export const CARE_JOURNEY: ChecklistPhase[] = [
  {
    id: "first-24h",
    title: "First 24 Hours",
    subtitle: "Pause. Breathe. You don't have to act on everything at once.",
    categories: [
      {
        category: "Emotional Stabilization",
        items: [
          { id: "p1", title: "Pause and process emotions", description: "Give yourself a quiet moment.", why: "Shock and grief are valid responses. They don't need to be fixed.", reassurance: "There is no right way to feel right now." },
          { id: "p2", title: "Identify one immediate support person", description: "A friend, sibling or neighbour you trust.", why: "Carrying this alone is harder than it needs to be.", reassurance: "Even one person makes a difference." },
          { id: "p3", title: "Write down doctor's name and contact", description: "Note the consulting doctor and ward.", why: "Memory is unreliable under stress. Writing it down helps.", reassurance: "Small notes save future worry." },
          { id: "p4", title: "Gather medical documents", description: "Reports, prescriptions, referrals in one place.", why: "Future appointments will go more smoothly.", reassurance: "A single folder is enough for now." },
          { id: "p5", title: "Avoid making big decisions today", description: "Defer non-urgent choices.", why: "Decisions made in shock often need revisiting.", reassurance: "Tomorrow is soon enough." },
        ],
      },
      {
        category: "Medical Clarity",
        items: [
          { id: "m1", title: "Understand the diagnosis", description: "Ask the doctor to explain in plain language.", why: "Clarity reduces anxiety more than answers.", reassurance: "It's okay to ask the same question twice." },
          { id: "m2", title: "Clarify the prognosis", description: "Ask about likely course and timing, gently.", why: "Knowing helps you prioritise what matters most.", reassurance: "You can pause this conversation anytime." },
          { id: "m3", title: "Ask about treatment goals", description: "Cure, control, or comfort — which is realistic?", why: "Goals shape every decision ahead.", reassurance: "There are no wrong answers." },
          { id: "m4", title: "Request a written medical summary", description: "Most hospitals provide one on request.", why: "Useful for second opinions and family updates.", reassurance: "You don't have to remember everything." },
        ],
      },
      {
        category: "Family Coordination",
        items: [
          { id: "f1", title: "Inform immediate family", description: "Share what you know, gently.", why: "They will want to support you and your loved one.", reassurance: "You can share more details later." },
          { id: "f2", title: "Decide on a communication approach", description: "One group chat, weekly updates, or via one relative.", why: "Repeating news is emotionally exhausting.", reassurance: "Choose what feels lightest for you." },
          { id: "f3", title: "Identify a primary caregiver", description: "Often this becomes you — but it can be shared.", why: "Clear roles reduce family friction.", reassurance: "This can change over time." },
        ],
      },
    ],
  },
  {
    id: "first-week",
    title: "First Week",
    subtitle: "A gentle structure begins to form. Move at your own pace.",
    categories: [
      {
        category: "Medical",
        items: [
          { id: "w1", title: "Schedule specialist consultations", description: "Oncologist, palliative team, or relevant specialists.", why: "Early appointments give more options.", reassurance: "Bring someone with you if you can." },
          { id: "w2", title: "Organize medications", description: "List names, dosages and timings.", why: "Prevents missed doses and confusion.", reassurance: "A simple notebook is enough." },
          { id: "w3", title: "Understand treatment pathways", description: "Ask what comes next, and what alternatives exist.", why: "Knowing the path makes the road feel shorter.", reassurance: "Plans can change. That's normal." },
          { id: "w4", title: "Discuss palliative care options", description: "Palliative care is comfort care — it doesn't mean giving up.", why: "Early palliative input often improves quality of life.", reassurance: "Asking about it is wise, not pessimistic." },
          { id: "w5", title: "Prepare emergency contacts", description: "Doctor, hospital, family, ambulance (995 in SG).", why: "Saves precious minutes during stressful moments.", reassurance: "Print one copy for the fridge." },
        ],
      },
      {
        category: "Financial (Singapore)",
        items: [
          { id: "fi1", title: "Review insurance coverage", description: "Check MediShield Life and Integrated Shield Plans.", why: "Coverage rules vary by hospital class and treatment.", reassurance: "Most policies are more flexible than expected." },
          { id: "fi2", title: "Estimate treatment costs", description: "Hospital bill estimators and consultation pricing.", why: "Surprise costs are the most stressful kind.", reassurance: "Subsidies often apply." },
          { id: "fi3", title: "Explore CHAS, CareShield, MediFund", description: "Singapore subsidies for caregiving and medical support.", why: "Many families don't realise they qualify.", reassurance: "Medical social workers can help apply." },
        ],
      },
      {
        category: "Legal",
        items: [
          { id: "l1", title: "Learn about Advance Care Planning (ACP)", description: "A conversation, not a contract.", why: "Helps your loved one's wishes be honoured.", reassurance: "You don't have to do this in one sitting." },
          { id: "l2", title: "Consider Lasting Power of Attorney (LPA)", description: "Allows a trusted person to make decisions if needed.", why: "Brings clarity if capacity changes.", reassurance: "Discussing it is an act of love, not loss." },
          { id: "l3", title: "Discuss wills if appropriate", description: "Only if and when it feels right.", why: "Avoids future family complications.", reassurance: "There is no rush." },
        ],
      },
      {
        category: "Home Preparation",
        items: [
          { id: "h1", title: "Assess mobility needs", description: "Stairs, bathroom, bed access.", why: "Small changes prevent injuries.", reassurance: "AIC offers loan equipment in Singapore." },
          { id: "h2", title: "Plan transportation", description: "For appointments and outings.", why: "Logistics are tiring. Plan once, reuse often.", reassurance: "Ride-share or family rotation works well." },
        ],
      },
      {
        category: "Emotional",
        items: [
          { id: "e1", title: "Schedule rest for yourself", description: "Even 30 quiet minutes counts.", why: "You cannot pour from an empty cup.", reassurance: "Resting is part of caring." },
          { id: "e2", title: "Ask for family support", description: "Be specific about what would help.", why: "People want to help but don't know how.", reassurance: "Asking is a strength." },
        ],
      },
    ],
  },
  {
    id: "first-month",
    title: "First Month",
    subtitle: "Settling into a rhythm. Memories matter as much as logistics.",
    categories: [
      {
        category: "Family Coordination",
        items: [
          { id: "fm1", title: "Create a shared caregiving schedule", description: "Visits, meals, appointments — visible to everyone.", why: "Reduces last-minute coordination stress.", reassurance: "Even a shared note works." },
          { id: "fm2", title: "Coordinate visitation gently", description: "Quality over quantity.", why: "Too many visitors can be tiring.", reassurance: "Quiet visits count too." },
          { id: "fm3", title: "Clarify caregiving responsibilities", description: "Who handles meds, meals, finances, appointments.", why: "Clear roles reduce friction.", reassurance: "Roles can shift as needed." },
        ],
      },
      {
        category: "Memories",
        items: [
          { id: "me1", title: "Record stories together", description: "Childhood, family history, life lessons.", why: "Voices and stories become treasures.", reassurance: "A phone recording is enough." },
          { id: "me2", title: "Take family photos", description: "Casual, candid, in everyday clothes.", why: "These photos will mean more than you imagine.", reassurance: "No need for perfection." },
          { id: "me3", title: "Visit meaningful places", description: "Hawker centres, kampung, old neighbourhood.", why: "Familiar places stir beautiful memories.", reassurance: "A short outing is plenty." },
          { id: "me4", title: "Preserve recipes and traditions", description: "Cook together. Write it down.", why: "Tastes carry love across generations.", reassurance: "Imperfect notes are perfect." },
        ],
      },
      {
        category: "Practical",
        items: [
          { id: "pr1", title: "Organize important documents", description: "IC, insurance, bank, CPF, will.", why: "Saves searching during stressful moments.", reassurance: "One folder is a gift to your future self." },
          { id: "pr2", title: "Set up medication tracking", description: "Pill box or simple app.", why: "Prevents missed and double doses.", reassurance: "Simple systems work best." },
        ],
      },
    ],
  },
  {
    id: "ongoing",
    title: "Ongoing Care",
    subtitle: "Sustaining yourself is part of sustaining them.",
    categories: [
      {
        category: "Burnout Prevention",
        items: [
          { id: "b1", title: "Build small rest into each day", description: "10 minutes of stillness, a walk, a quiet drink.", why: "Burnout creeps in slowly.", reassurance: "Rest is not selfish." },
          { id: "b2", title: "Eat regularly", description: "Even small meals matter.", why: "Caregivers often skip meals without realising.", reassurance: "A bowl of porridge counts." },
          { id: "b3", title: "Delegate one thing this week", description: "Groceries, laundry, a phone call.", why: "Every small lift adds up.", reassurance: "Receiving help is also a gift to others." },
        ],
      },
      {
        category: "Relationship",
        items: [
          { id: "r1", title: "Have one meaningful conversation", description: "About memories, gratitude, or simple things.", why: "These moments often matter most later.", reassurance: "Silence together also counts." },
          { id: "r2", title: "Express gratitude out loud", description: "Tell them what they mean to you.", why: "Words spoken are easier than words left unsaid.", reassurance: "Brief and honest is beautiful." },
        ],
      },
    ],
  },
  {
    id: "end-of-life",
    title: "End-of-Life Preparation",
    subtitle: "A tender chapter. You are not alone in this.",
    categories: [
      {
        category: "Comfort & Care",
        items: [
          { id: "eol1", title: "Confirm preferred place of care", description: "Home, hospice, or hospital.", why: "Honouring wishes brings peace.", reassurance: "Wishes can be revisited." },
          { id: "eol2", title: "Engage hospice support", description: "HCA Hospice, Assisi, Dover Park, Singapore Cancer Society.", why: "Specialised support eases the journey.", reassurance: "Hospice is care, not surrender." },
          { id: "eol3", title: "Prepare comfort items", description: "Favourite blanket, music, photos nearby.", why: "Familiar things bring calm.", reassurance: "Small touches matter most." },
        ],
      },
      {
        category: "After-Care Logistics",
        items: [
          { id: "eol4", title: "Note funeral preferences gently", description: "If conversations allow.", why: "Removes future decision burden.", reassurance: "There is no perfect time. Whenever feels right." },
          { id: "eol5", title: "Prepare a list of people to inform", description: "When the time comes.", why: "Reduces overwhelm in tender moments.", reassurance: "A list is a kindness to your future self." },
        ],
      },
    ],
  },
];

export const SG_RESOURCES = [
  { name: "Agency for Integrated Care (AIC)", desc: "One-stop caregiver support, equipment loan, subsidies.", url: "https://www.aic.sg" },
  { name: "Singapore Hospice Council", desc: "Directory of hospice and palliative providers.", url: "https://singaporehospice.org.sg" },
  { name: "HCA Hospice", desc: "Home hospice care across Singapore.", url: "https://www.hca.org.sg" },
  { name: "MediShield Life", desc: "National basic health insurance.", url: "https://www.moh.gov.sg/medishield-life" },
  { name: "Advance Care Planning", desc: "Living Matters — start the conversation.", url: "https://www.livingmatters.sg" },
  { name: "Office of the Public Guardian (LPA)", desc: "Lasting Power of Attorney.", url: "https://www.msf.gov.sg/opg" },
  { name: "CHAS Subsidies", desc: "Community Health Assist Scheme.", url: "https://www.chas.sg" },
  { name: "Singapore Cancer Society", desc: "Patient services, hospice, financial help.", url: "https://www.singaporecancersociety.org.sg" },
];

export const BUCKET_TEMPLATES = [
  { category: "Experiences", title: "Share a favourite hawker meal together" },
  { category: "Experiences", title: "A quiet morning at the botanic gardens" },
  { category: "Experiences", title: "Watch a beloved old film at home" },
  { category: "Experiences", title: "Listen to favourite songs together" },
  { category: "Legacy", title: "Record their life advice on voice memo" },
  { category: "Legacy", title: "Write down a treasured family recipe" },
  { category: "Legacy", title: "Capture stories from their childhood" },
  { category: "Legacy", title: "Letters for future family milestones" },
  { category: "Connection", title: "Share three things you're grateful for" },
  { category: "Connection", title: "A quiet afternoon, no phones" },
  { category: "Connection", title: "Look through old photo albums together" },
  { category: "Simple Joys", title: "Watch a sunset from the void deck" },
  { category: "Simple Joys", title: "A familiar drink at a kopitiam" },
  { category: "Simple Joys", title: "A short drive past their old neighbourhood" },
];
