<template>
<div class="parzival-facsimile-viewer">
  <div class="parzival-facsimile"></div>
  <div class="parzival-facsimile-nav">
    <div class="field has-addons">
      <div class="control">
        <button class="button is-dark is-outlined" @click="zoomIn"><i class="fa fa-search-plus"></i></button>
      </div>
      <div class="control">
        <button class="button is-dark is-outlined" @click="zoomOut"><i class="fa fa-search-minus"></i></button>
      </div>
      <div class="control">
        <button class="button is-dark is-outlined" @click="rotateLeft"><i class="fa fa-rotate-left"></i></button>
      </div>
      <div class="control">
        <button class="button is-dark is-outlined" @click="rotateRight"><i class="fa fa-rotate-right"></i></button>
      </div>
    </div>
  </div>
  <figure class="image parzival-quire-view" v-if="quireIconPath">
    <img :src="quireIconPath"/>
  </figure>
  <nav class="breadcrumb parzival-quire-path" v-if="quireIconPath">
    <ol>
      <li class="is-active"><a>{{ quireTitle }}</a></li>
      <li class="is-active"><a>{{ pageTitle }}</a></li>
      <li class="is-active"><a>{{ hands }}</a></li>
      <li class="is-active"><a>{{ verseTitle }}</a></li>
    </ol>
  </nav>
</div>
</template>

<script>
export { default } from './FacsimileViewer'
</script>
