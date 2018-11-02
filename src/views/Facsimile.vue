<template functional>
<container :manuscript="props.manuscript" :pages="props.pages" :verse="props.verse">
  <div class="parzival-page">
    <div class="parzival-page-facsimile">
      <facsimile-viewer :manuscript="props.manuscript" :pages="props.pages"></facsimile-viewer>
    </div>
  </div>
</container>
</template>
