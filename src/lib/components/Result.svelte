<script lang="ts">
  import type { SpotifyResponse } from "$lib/server/spotify";
  import { getBestImage } from "$lib/utils/image";

    export let result: SpotifyResponse;
    let showDescription: boolean = false
    let showMarkets: boolean = false

    function toggleDescription() {
        showDescription = !showDescription;
    }

    function toggleMarkets() {
        showMarkets = !showMarkets
    }
</script>

<div class="row justify-content-center text-center">
    <div class="card" >
        {#if result.images?.length}
        <img class="card-img-top image" alt="{result.name}" src="{getBestImage(result.images, 600)?.url}">
        {/if}
        <div class="card-body">
            <h5 class="card-title">{result.name}</h5>
            {#if result.type === 'track'}
                <p class="card-text">
                    {result.artists.map(a => a.name).join(', ')}
                    <img alt="{result.album.name}" src="{getBestImage(result.album.images, 400)?.url}">
                </p>
            {/if}
            {#if result.type === 'audiobook' || result.type === 'episode' || result.type === 'show'}
                {#if result.type !== 'episode'}
                    <p>
                        <button class="btn btn-secondary" type="button" on:click={toggleMarkets}>
                        {showMarkets ? 'Hide' : 'Show'} markets
                        </button>
                    </p>
                    <div class:collapse="{!showMarkets}" class:collapse.show="{showMarkets}" id="{result.id}-markets">
                        <p>
                            {#each result.available_markets ?? [] as market}
                                <span style="margin: 3px;" class="badge bg-secondary">{market}</span>
                            {/each}
                        </p>
                    </div>
                {/if}

                <p>
                    <button class="btn btn-secondary" type="button" on:click={toggleDescription}>
                    {showDescription ? 'Hide' : 'Show'} description
                    </button>
                </p>
                <div class:collapse="{!showDescription}" class:collapse.show="{showDescription}" id="{result.id}">
                    <p class="card-text">{@html result.html_description}</p>
                </div>
            {/if}
            <a href="{result.uri}" class="btn btn-primary">App</a>
            <a href="{result.external_urls.spotify}" target="_blank" class="btn btn-primary">Web</a>
        </div>
    </div>
</div>

<style>
    .card {
        margin: 10px;
    }
    .image {
        min-width: 10rem;
        width: 25%;
        margin: 0 auto
    }
</style>