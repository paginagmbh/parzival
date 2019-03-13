<template>
<div class="parzival-transcript-viewer parzival-overflow-scroll">
  <div class="hero" v-if="text.length == 0">
    <div class="hero-body">
      <article class="message is-large is-warning">
        <div class="message-body content">
          <p>Folgende Verse sind nicht transkribiert:</p>
          <ul>
            <li>NP 2000–7999;</li>
            <li>NP 10000–10999;</li>
            <li>NP 12000–14999;</li>
            <li>NP 15208–250999.</li>
          </ul>
        </div>
      </article>
    </div>
  </div>

  <article class="parzival-transcript-column"
           v-for="t in text"
           :key="manuscript + t.column"
           :data-manuscript="manuscript"
           :data-column="t.column" ref="columns">
    <header>{{ manuscriptSigil }} – {{ numTitle(t.column) }}</header>
    <section class="section">
      <table class="table parzival-content">
        <tbody>
          <tr v-for="(l, li) in t.contents" :key="li"
              class="parzival-verse-focus"
              @click="updateVerse(l.verse)">
            <template v-if="l.type == 'heading'">
              <td class="parzival-heading" colspan="2">
                <div v-for="(h, hi) in l.heading" :key="hi">[{{ h }}]</div>
              </td>
            </template>
            <template v-if="l.type == 'verse'">
              <th class="parzival-verse-num"
                  :class="{ 'is-active': l.type === 'verse' && verse === l.verse }"
                  :data-verse="l.verse"
                  v-waypoint="verseWaypoint">
                {{ l.verse }}
              </th>
              <td class="parzival-verse" v-html="l.html"></td>
            </template>
          </tr>
        </tbody>
      </table>
    </section>
  </article>
  <button class="parzival-transcript-doc-toggle button is-info is-small"
          v-if="text.length > 0"
          @click="toggle('transcriptDocModal')">
    <i class="fa fa-info"></i>
  </button>
  <div class="parzival-transcript-doc modal"
       :class="active('transcriptDocModal')"
       @keyup.esc="toggle('transcriptDocModal')"
       v-focus="transcriptDocModal"
       tabindex="1002">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="hero is-light">
        <div class="hero-body">
          <div class="container content parzival-content">
            <h3>Erläuterungen zur Transkription</h3>

            <p>Die Transkriptionen der Texte aus den Handschriften V und V'
            erfolgen handschriftengetreu. Nicht umgesetzt wird das geschweifte
            z. Die Abkürzungen werden in runden Klammern aufgelöst.</p>

            <p>Zeilenumbrüche in Prosaabschnitten werden mit einem senkrechten
            Strich (|) markiert.</p>

            <p>Unlesbarkeit aufgrund von materieller Beeinträchtigung wird durch
            : bei einem, durch :: bei zwei und durch ::: bei drei oder mehr
            unleserlichen Buchstaben dargestellt. Durch <i>:::</i> (kursiv)
            markiert wird der Textverlust infolge Beschnitts bei der Anweisung
            an den Rubrikator auf Bl. 139va von Hs. V'.</p>

            <p>Erläuternde Zusätze erscheinen kursiv in eckigen Klammern.</p>

            <p>Initialen und Paratexte werden wie folgt ausgezeichnet:</p>
            <ul class="parzival-sample">
              <li><span class="hi red">rot</span> = rote Überschriften;</li>
              <li><span class="hi red bold">rot in Fettdruck</span> = Eingangsinitialen;</li>
              <li><span class="anweisung">kursiv</span> = Anweisungen an den Rubrikator.</li>
            </ul>

            <p>Die unterschiedlichen Korrekturarten werden wie folgt unterschieden:</p>
            <ul class="parzival-sample">
              <li><span class="damage">grau hinterlegt</span> = Korrektur durch aufgeklebtes Pergamentstück;</li>
              <li><span class="damage">grau hinterlegt</span> und <span class="corr">unterpunktet</span> = Korrektur durch Rasur;</li>
              <li><span class="corr">unterstrichelt</span> = Korrektur durch Streichung.</li>
            </ul>

            <p>Die Verszählung erfolgt beim <b>›Nuwen Parzifal‹ (NP)</b> nach
            derjenigen der Ausgabe Parzifal von Claus Wisse und Philipp Colin
            (1331–1336). Eine Ergänzung der Dichtung Wolframs von Eschenbach.
            Zum ersten Male hrsg. von Karl Schorbach (Elsässische
            Litteraturdenkmäler aus dem XIV–XVII. Jahrhundert 5),
            Strassburg/London 1888 [Neudruck Berlin/New York 1974 und
            (Berlin/Boston 2010)].</p>

            <p>Fortlaufend durchnummeriert hingegen werden mit voranstehendem
            'Pr' der Prologus nach der ›Élucidation‹, dt., sowie mit
            voranstehendem 'Ep' der Epilog zum ›Rappoltsteiner Parzifal‹ von
            Philipp Colin.</p>

            <p>Die Verszählung bei <b>Wolframs von Eschenbach ›Parzival‹</b> folgt
            derjenigen der Ausgabe Wolfram von Eschenbach. Parzival.
            Studienausgabe. 2. Auflage. Mittelhochdeutscher Text nach der
            sechsten Ausgabe von Karl Lachmann, Übersetzung von Peter Knecht.
            Mit Einführungen zum Text der Lachmannschen Ausgabe und in Probleme
            der ›Parzival‹-Interpretation von Bernd Schirok (de Gruyter Texte),
            Berlin/New York 2003.</p>
          </div>
        </div>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="toggle('transcriptDocModal')"></button>
    </div>
  </div>
</div>
</template>

<script>
export { default } from './TranscriptViewer'
</script>
