-- ============================================
-- WORDS PATCH — 31 additional words
-- Brings total to 150. Run in Supabase SQL Editor.
-- ============================================

INSERT INTO public.words (word, definition, difficulty, synonyms, antonyms) VALUES

-- DIFFICULTY 1
('candid',      'Truthful and straightforward; frank in expression',                                 1, ARRAY['honest','frank','open','direct'],                 ARRAY['evasive','dishonest','guarded','deceptive']),
('gracious',    'Courteous, kind, and pleasant in manner',                                           1, ARRAY['courteous','polite','kind','benevolent'],         ARRAY['rude','ungracious','unkind','discourteous']),
('vivid',       'Producing powerful feelings or strong, clear images in the mind',                   1, ARRAY['striking','bright','lively','intense'],           ARRAY['dull','faded','vague','lifeless']),
('inquisitive', 'Having or showing an interest in learning things; curious',                         1, ARRAY['curious','questioning','probing','inquiring'],    ARRAY['indifferent','incurious','apathetic','uninterested']),
('resolute',    'Admirably purposeful, determined, and unwavering',                                  1, ARRAY['determined','firm','steadfast','decided'],        ARRAY['irresolute','wavering','indecisive','hesitant']),

-- DIFFICULTY 2
('benign',      'Gentle and kindly; not harmful in effect',                                          2, ARRAY['harmless','gentle','kind','mild'],                ARRAY['harmful','malign','hostile','dangerous']),
('comply',      'To act in accordance with a wish or command',                                       2, ARRAY['obey','conform','follow','submit'],               ARRAY['defy','resist','refuse','disobey']),
('digress',     'To leave the main subject temporarily in speech or writing',                        2, ARRAY['deviate','stray','wander','diverge'],             ARRAY['focus','continue','stay','persist']),
('eloquence',   'Fluent or persuasive speaking or writing',                                          2, ARRAY['expressiveness','fluency','articulateness','rhetoric'], ARRAY['inarticulateness','silence','stammering','hesitancy']),
('implicit',    'Suggested though not directly expressed; unquestioning and absolute',               2, ARRAY['implied','understood','tacit','unspoken'],        ARRAY['explicit','stated','expressed','direct']),
('lucid',       'Expressed clearly; easy to understand; mentally clear',                             2, ARRAY['clear','intelligible','coherent','transparent'],  ARRAY['obscure','confusing','muddled','vague']),
('prudent',     'Acting with or showing care and thought for the future',                            2, ARRAY['wise','careful','sensible','judicious'],          ARRAY['reckless','imprudent','careless','foolish']),

-- DIFFICULTY 3
('abridge',     'To shorten a text or piece of writing without losing the sense',                    3, ARRAY['shorten','condense','abbreviate','summarize'],    ARRAY['expand','extend','lengthen','elaborate']),
('beguile',     'To charm or enchant, sometimes in a deceptive way',                                3, ARRAY['charm','enchant','captivate','deceive'],          ARRAY['repel','bore','disenchant','alienate']),
('chide',       'To scold or rebuke someone gently',                                                3, ARRAY['scold','reprimand','rebuke','reproach'],          ARRAY['praise','commend','approve','compliment']),
('decorum',     'Behavior in keeping with good taste and propriety',                                 3, ARRAY['propriety','etiquette','dignity','correctness'],  ARRAY['impropriety','rudeness','indecency','vulgarity']),
('evasive',     'Tending to avoid commitment or direct answers',                                     3, ARRAY['indirect','elusive','ambiguous','vague'],         ARRAY['direct','forthright','candid','straightforward']),
('fervent',     'Having or displaying a passionate intensity of feeling',                            3, ARRAY['passionate','intense','ardent','zealous'],        ARRAY['apathetic','indifferent','cold','unenthusiastic']),
('impede',      'To delay or prevent progress by obstructing',                                       3, ARRAY['obstruct','hinder','block','hamper'],             ARRAY['facilitate','aid','assist','advance']),
('infer',       'To deduce or conclude information from evidence and reasoning',                     3, ARRAY['deduce','conclude','gather','reason'],            ARRAY['state','declare','assert','announce']),

-- DIFFICULTY 4
('abscond',     'To leave hurriedly and secretly, typically to avoid detection',                     4, ARRAY['flee','escape','bolt','vanish'],                  ARRAY['remain','stay','appear','face']),
('ameliorate',  'To make something bad or unsatisfactory better',                                    4, ARRAY['improve','better','enhance','remedy'],            ARRAY['worsen','aggravate','damage','deteriorate']),
('bombastic',   'High-sounding language with little meaning; inflated speech',                       4, ARRAY['pompous','grandiose','pretentious','verbose'],    ARRAY['modest','understated','plain','simple']),
('diffident',   'Modest or shy due to a lack of self-confidence',                                    4, ARRAY['shy','timid','modest','reserved'],                ARRAY['confident','bold','assertive','assured']),
('gainsay',     'To deny or contradict; to speak against or oppose',                                 4, ARRAY['deny','contradict','dispute','oppose'],           ARRAY['confirm','agree','support','affirm']),
('laconic',     'Using very few words; brief and concise in speech',                                 4, ARRAY['brief','terse','concise','succinct'],             ARRAY['verbose','wordy','garrulous','loquacious']),

-- DIFFICULTY 5
('desultory',   'Lacking a plan, purpose, or enthusiasm; going from subject to subject',             5, ARRAY['random','haphazard','aimless','erratic'],         ARRAY['methodical','systematic','focused','deliberate']),
('execrable',   'Extremely bad or unpleasant; deserving strong condemnation',                        5, ARRAY['appalling','atrocious','dreadful','deplorable'],  ARRAY['excellent','admirable','wonderful','superb']),
('loquacious',  'Tending to talk a great deal; excessively talkative',                               5, ARRAY['talkative','garrulous','verbose','chatty'],       ARRAY['taciturn','reticent','quiet','reserved']),
('mendacious',  'Not telling the truth; lying',                                                      5, ARRAY['dishonest','deceitful','lying','untruthful'],     ARRAY['honest','truthful','sincere','candid']),
('perspicuous', 'Clearly expressed and easily understood; lucid',                                    5, ARRAY['clear','lucid','plain','intelligible'],           ARRAY['obscure','unclear','confusing','opaque']);
