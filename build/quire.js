const { Parser } = require("jison");


const lex = { rules: [
] };

const bnf = {
};

const parser = new Parser({ lex, bnf });

const v = "2 V<20> + II<24> + 5 VI<84> + III<90> + I<92> + II<96> + VI<108> + (IV-1)<115> + (VI-2)<125> + (VI+I<133/134>)<139> + V<149> + VI<161> + V<171> + (V+I<176/177>)<183> + VI<195> + V<205> + III<211> + II<215> + V<225> + VI<237> + II<247> + I<249> + IV<257> + II<261> + (V+I<270/271>)<273> + 2 VI<297> + V<307> + VI<319> + I<320/HSp>";

const vv = "II<III> + 7 IV<56> + (I-1)<57> + III<63> + 5 IV<103> + III<109> + (I-1)<110> + 8 IV<174> + (IV-1)<181> + I<HSp>";