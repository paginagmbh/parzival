<template>
  <div class="parzival-transcript-doc modal"
    :class="active('transcriptDocModal')"
    @keyup.esc="$emit('close-info')"
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

            <p>Längsstriche markieren Versumstellungen.</p>

            <p>Zeilenumbrüche in Prosaabschnitten werden mit einem senkrechten
            Strich (|) markiert.</p>

            <p>Unlesbarkeit aufgrund von materieller Beeinträchtigung wird durch
            : bei einem, durch :: bei zwei und durch ::: bei drei oder mehr
            unleserlichen Buchstaben dargestellt. Durch <i>:::</i> (kursiv)
            markiert wird der Textverlust infolge Beschnitts bei der Anweisung
            an den Rubrikator auf Bl. 139va von Hs. V'.</p>

            <p>Initialen und Paratexte werden wie folgt ausgezeichnet:</p>
            <ul class="parzival-sample">
              <li><span class="hi red">rot</span> = rote Überschriften;</li>
              <li><span class="hi red bold">rot in Fettdruck</span> = Eingangsinitialen;</li>
              <li><span class="anweisung">kursiv</span> = Anweisungen an den Rubrikator.</li>
            </ul>

            <p>Die unterschiedlichen Korrekturarten werden wie folgt unterschieden:</p>
            <ul class="parzival-sample">
              <li><span class="damage">grau hinterlegt</span>, <span class="klebung">eingerahmt</span> und <span class="corr">unterpunktet</span> = Korrektur durch aufgeklebtes Pergamentstück;</li>
              <li><span class="damage">grau hinterlegt</span> und <span class="corr">unterpunktet</span> = Korrektur durch Rasur;</li>
              <li><span class="del">durchgestrichen</span> = Korrektur durch Streichung.</li>
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

            <p>Zu den Abkürzungen siehe die
              <router-link :to="{ name: 'introduction', hash: '#p3_1_5'}">
                Einführung Kapitel 3.1.5.</router-link></p>

            <p>Die Ergänzung [0] am Ende einer Versnummer bezeichnet Kustoden, Reklamanten und Notizen in den Handschriften (in Kursivdruck).</p>

            <p>Die Ergänzung [01][01] am Ende einer Versnummer bezeichnet eine Anweisung an den Rubrikator (in Kursivdruck) (betrifft nur V').</p>

            <p>Die Ergänzung [01] am Ende einer Versnummer wird grundsätzlich bei Kapitelüberschriften und im Zusammenhang mit den kürzeren Texten auf Blatt 115r/v und Blatt 320v von Handschrift V verwendet. Folgen mehrere Paratexte aufeinander, werden diese der Reihenfolge nach mit [01], [02] usw. nummeriert (Beispiel siehe V', 793.27[01], 793.27[02]).</p>

            <p>Die Ergänzung [1] am Ende einer Versnummer bezeichnet einen Plusvers oder einen doppelt abgeschriebenen Vers.</p>

            <p>Zwischen senkrechte Striche gesetzt erscheinen in Kursivdruck erläuternde Zusätze wie Inhaltsangaben und Hinweise auf nicht transkribierte Abschnitte. Diese Erläuterungen werden je nach Position mit den Versnummerendungen [0], [01], [02], [1] oder [2] bezeichnet.</p>
          </div>
        </div>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="$emit('close-info')"></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TranscriptInfo',
  props: ['transcriptDocModal']
}
</script>
