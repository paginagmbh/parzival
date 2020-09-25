<template>
<div class="parzival-transcript-viewer parzival-overflow-scroll">
  <div class="hero" v-if="verseTitle && text.length == 0">
    <div class="hero-body">
      <article class="message">
        <div class="message-body content">
          <p v-if="lastSearch && lastSearch.length">Ihre Suche nach „{{ lastSearch }}“ ergab keinen Treffer.</p>
          <p>Folgende Verse sind nicht transkribiert:</p>
          <div v-html="excludedVersesHtml"/>
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
              <td v-if="l.transpositionStart" class="parzival-transposition-row active right" :rowspan="l.transpositionRowSpan">
              </td>
              <template v-else-if="l.transpositionPart"><!-- empty, no td here --></template>
              <td v-else class="parzival-transposition-row"></td>
              <th class="parzival-verse-num"
                  :class="{ 'is-active': verse === l.verse }"
                  :data-verse="l.verse"
                  v-waypoint="verseWaypoint">
                {{ l.verse }}
              </th>
              <td class="parzival-verse" v-html="l.html"></td>
          </tr>
        </tbody>
      </table>
    </section>
  </article>
  <transcript-info :transcriptDocModal="transcriptDocModal" v-on:close-info="toggle('transcriptDocModal')" />
</div>
</template>

<script>
export { default } from './TranscriptViewer'
</script>
