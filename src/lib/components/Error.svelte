<script lang="ts">
    export let message: string | undefined | null;
</script>

{#if message}
  <div class="container error-container">
    <div class="alert alert-danger text-center" role="alert">
        {message}
      </div> 
  </div> 
{/if}

<style>
    div.error-container {
        margin: 10px;
    }
</style>