<template>
<div class="parzival-transcript-viewer">
  <pagination v-if="text.length > 0" :manuscript="manuscript" :pages="pages"></pagination>
  <article class="message is-warning" v-if="text.length == 0">
    <div class="message-body">
      <p>Kein Transkript für diese Seite</p>
    </div>
  </article>
  <article class="message" v-for="t in text"
           :key="manuscript + t.column"
           :class="{ 'is-primary': t.columnSigil === 'a', 'is-light': t.columnSigil === 'b'}"
           :data-column="t.column" ref="columns">
    <div class="message-header">
      <p>{{ manuscript }} – {{ t.column }}</p>
    </div>
    <div class="message-body">
      <table class="table is-fullwidth">
        <tbody>
          <tr v-for="(l, li) in t.contents" :key="li"
              class="parzival-verse-focus"
              :class="{ 'is-active': l.type === 'verse' && verse === l.verse }"
              @click="updateVerse(l.verse)">
            <template v-if="l.type == 'heading'">
              <td class="parzival-heading" colspan="2">
                <div v-for="(h, hi) in l.heading" :key="hi">[{{ h }}]</div>
              </td>
            </template>
            <template v-if="l.type == 'verse'">
              <th class="parzival-verse-num"
                  :class="{ 'is-italic': l.otherPage }"
                  v-waypoint="verseWaypoint">
                <span>{{ l.verse }}</span>
              </th>
              <td class="parzival-verse" v-html="l.html"></td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
  <pagination :manuscript="manuscript" :pages="pages"></pagination>
</div>
</template>

<script>
export { default } from './TranscriptViewer'
</script>
