<template>
<container class="parzival-transcript" :manuscript="manuscript" :pages="pages">
  <div class="parzival-transcript-view">
    <div class="tile is-ancestor">
      <div class="tile is-parent" :class="classes.orientation">
        <div class="tile is-child" ref="transcript" :class="classes.transcript">
          <pagination v-if="transcriptText.length > 0" :manuscript="manuscript" :pages="pages"></pagination>
          <article class="message is-warning" v-if="transcriptText.length == 0">
            <div class="message-body">
              <p>Kein Transkript für diese Seite</p>
            </div>
          </article>
          <article class="message" v-for="t in transcriptText" :key="manuscript + t.column" :class="t.columnClass" :data-column="t.column" ref="columns">
            <div class="message-header">
              <p>{{ manuscript }} – {{ t.column }}</p>
            </div>
            <div class="message-body">
              <table class="table is-fullwidth">
                <tbody>
                  <tr v-for="(l, li) in t.contents" :key="li">
                    <template v-if="l.type == 'heading'">
                      <td class="parzival-heading" colspan="2">
                        <div v-for="(h, hi) in l.heading" :key="hi">[{{ h }}]</div>
                      </td>
                    </template>
                    <template v-if="l.type == 'verse'">
                      <th class="parzival-verse-num">{{ l.verse }}</th>
                      <td class="parzival-verse" v-html="l.html"></td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
          <pagination :manuscript="manuscript" :pages="pages"></pagination>
        </div>
        <div class="tile is-child">
          <facsimile-viewer :manuscript="manuscript" :pages="pages"></facsimile-viewer>
        </div>
      </div>
    </div>
  </div>
</container>
</template>

<script>
export { default } from './Transcript'
</script>
