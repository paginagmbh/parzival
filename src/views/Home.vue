<template>
<div class="parzival-home is-dark hero is-fullheight">
  <div class="hero-body">
    <div class="container">
      <div class="title">Nuwer Parzifal</div>
      <div class="subtitle">
        Original und Kopie des ›Rappoltsteiner Parzifal‹
        <br/>
        Handschriftliche Überlieferung und Textgenese im 14. Jahrhundert
      </div>
      <div class="field is-grouped">
        <div class="control">
          <router-link class="button is-light is-outlined is-medium" to="/introduction">
            <span class="icon"><i class="fa fa-angle-right"></i></span><span>Einleitendes</span>
          </router-link>
        </div>
        <div class="control">
          <router-link class="button is-primary is-outlined is-medium" to="/V/115v/transcript">
            <span class="icon"><i class="fa fa-angle-right"></i></span><span>Zu den Handschriften</span>
          </router-link>
        </div>
      </div><a class="is-italic" href="http://www.parzival.unibe.ch/">Teil des Parzival-Projekts an der Universität Bern.</a>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'parzival-home',
  metaInfo () {
    return { title: 'Einstieg' }
  }
}
</script>
