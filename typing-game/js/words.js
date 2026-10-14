// Word & sentence banks. Lessons filter these down to words that only use the
// keys a child has learned so far, so the lists deliberately include lots of
// words that can be made from just the home row, then home + top row, etc.

export const WORDS = `
a as ad add ads all ask asks dad dads fad fads fall falls flag flags flask gas glad
had half hall halls has lad lads lag lash sad salad salsa sash shall dash flash glass
gala saga alfalfa ash hash alas slash haha

see seed seeds feed fed led sled sea else side slide slid lid kid kids hid hide dig digs
file fig figs like lake hike idea ideas egg eggs leaf deal sell shell she he his is if
did feel fish dish kiss giggle jiggle field shield ski skies lie safe sale sail said
life ease easel fiddle half

red ride rides fur sure rug rugs hug hugs jug dug fire hire her here hear rule rules
real read ruler rake ear ears far jar dark hard shark sugar sir use fudge judge
sludge large dear deer fear gear hula surf rides fries lurk

the at it tail tails tree trees try yes yay they trail rest test fast first day days
say stay hay tea eat sit tiger dusty tasty ready story yell yuck yard year kitty sky
fly fist gift tusk tusks dirty turtle star stars feast treat treats jelly silly
fluffy heart yet that this these teeth sticky fruit

wow who work roar roars food foot door water wet sweet toy toys joy frog frogs goose
show slow grow flower tower horse house dog dogs hot lot got go so do to too two of
for your you our out what with will would word words world yellow follow owl owls
low glow toad road rooster tooth fossil fossils yolk fog hello forest lost dodo
good look looks floor fold gold

quiet quick quest queen paw paws pop hop top stop shop pool play plays puppy happy
sleepy apple pie pig pet purple soup super jeep sheep ship dip flip flop people
squeak squid quake quilt equal spot spots step steps proud tropical

move very love five have give save dive vet visit mom my me am mud map jump jumps
stomp swamp meteor dream warm time milk smile small mammoth lava movie mommy memory
hum drum

dino dinos dinosaur nest bone bones baby big bug bugs banana run fun sun no not and
in on brown brave nine ten seven eleven bumpy bounce rainbow jungle bubble button
begin rabbit bird birds brain giant tiny funny honey bunny noon moon running

can cat cave claw claws comet crunch munch much such each catch chomp chick cookie
cub cute volcano pancake cactus carrot rock back black duck clock click cloud clouds
crab ice nice

box fox six mix wax ox taxi next extra exit relax rex

zoo zip zap zoom zebra zero buzz fizz pizza lazy crazy fuzzy dizzy zigzag puzzle
breeze sneeze frozen squeeze
`.split(/\s+/).filter(Boolean);

export const NAMES = [
  'Rex', 'Tops', 'Spike', 'Pip', 'Zara', 'Bruno', 'Luna', 'Max', 'Ivy', 'Otto', 'Rexy', 'Trixie',
  'Steggy', 'Petra', 'Bronty', 'Anky', 'Parry', 'Mia', 'Leo', 'Sam', 'Ava', 'Ben', 'Kai', 'Zoe',
];

export const SENTENCES = [
  'I see a dino.', 'The egg is big.', 'Rex can run fast.', 'We like to play.', 'The sun is hot.',
  'A baby dino hatched.', 'Look at the big egg.', 'Dinos stomp and roar.', 'I can type with all my fingers.',
  'The volcano is very tall.', 'We ate a big salad.', 'The ferns are green.', 'My dino likes to dance.',
  'Tops has three horns.', 'Pip is a tiny dino.', 'The jungle is full of bugs.', 'Let us go to the lake.',
  'The moon is up in the sky.', 'A comet zooms by.', 'I hug my dino friend.', 'Spike has spikes on his tail.',
  'Ivy hid the egg in the nest.', 'The dino had a fun day.', 'She sat on a rock.', 'He ate red fruit.',
];

export const QUESTIONS = [
  'Can you see the dino?', 'Where is the egg?', 'Who said roar?', 'Wow, that is a big dino!',
  'Look out!', 'Is it time to eat?', 'What a great day!', 'Do dinos like cake?', 'Yay, we did it!',
  'Did the egg hatch?', 'How tall is the volcano?', 'Stomp, stomp, stomp!',
];

export const APOSTROPHES = [
  "It's a dino!", "Don't wake the baby.", "I can't find my egg.", "Rex's tail is long.",
  "Let's play a game.", "That's a big bone.", "We're going to the lake.", "She's a fast runner.",
  "Where's the nest?", "I'm a happy dino.",
];

export const NUMBER_SENTENCES = [
  'I see 3 eggs.', 'There are 5 dinos.', 'Rex ate 10 leaves.', 'We found 2 bones.', 'It is 7 feet tall.',
  'My dino is 4 years old.', 'The nest has 6 eggs.', 'Count to 9.', 'Tops ate 8 ferns.', '1 2 3 go!',
  'The volcano is 1200 feet tall.', 'We hiked 15 miles.',
];

export const FACTS = [
  'Some dinosaurs were as small as chickens.',
  'Triceratops had three horns on its face.',
  'Stegosaurus had big plates along its back.',
  'Brontosaurus had a very long neck and a long tail.',
  'Pterosaurs could fly, but they were not dinosaurs.',
  'Ankylosaurus had a heavy club at the end of its tail.',
  'Tyrannosaurus rex had tiny arms but very strong jaws.',
  'Dinosaurs hatched from eggs, just like birds do today.',
  'Birds are living relatives of the dinosaurs.',
  'Scientists who study fossils are called paleontologists.',
  'Some dinosaurs ate plants and some ate meat.',
  'Many dinosaurs had feathers to keep them warm.',
  'Parasaurolophus had a long crest on its head that may have made sounds.',
  'Dinosaurs lived on Earth for more than one hundred and fifty million years.',
  'Fossils help us learn how dinosaurs lived and what they ate.',
  'The word dinosaur means terrible lizard.',
  'Velociraptor was about the size of a turkey.',
  'Some long necked dinosaurs were longer than a school bus.',
  'Dinosaur footprints can still be found in rocks today.',
  'A huge asteroid hit the Earth about 66 million years ago.',
  'The quick brown fox jumps over the lazy dog.',
  'Jackdaws love my big sphinx of quartz.',
  'How vexingly quick daft zebras jump!',
  'The five boxing wizards jump quickly.',
];
