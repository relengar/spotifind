<script lang="ts">
	import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    import Result from '$lib/components/Result.svelte';
    import IconButton from '$lib/components/IconButton.svelte';

    import type { SearchFilter, SearchType } from '$lib/server/spotifyApi';
    import { omit } from '$lib/utils';
    import { countries, type CountryCode } from '$lib/utils/countries';
  import Error from '$lib/components/Error.svelte';
    
    export let data: PageData;

    let errorMessage: string | null;

    type PaginationDirection = 'prev' | 'next';
    type FilterItem = keyof SearchFilter;

    const allTypes: SearchType[] = ['album', 'artist', 'playlist', 'track', 'show', 'episode', 'audiobook'];
    let type: SearchType = data.type ?? 'track';
    let searchTerm: string = data.search ?? '';

    let market: CountryCode | null = null;

    $: availableFilters = getFiltersForCategory(type)
    let filters: SearchFilter = data.filters;
    $: filterAttributes = Object.keys(filters) as FilterItem[]
    $: moreFilters = availableFilters.filter(attr => !filters.hasOwnProperty(attr));
    const defaultFilter: keyof SearchFilter = 'album';
    let nextFilter: keyof SearchFilter = getNextFilter();

    let loading = false;

    function getFiltersForCategory(category: SearchType = type): FilterItem[] {
        const allFilters: FilterItem[] = ['album', 'artist', 'track', 'upc', 'year'];
        const filterMap: Record<SearchType, FilterItem[]> = {
          track: allFilters.filter(f => f !== 'upc'),
          album: ['album', 'upc'],
          artist: ['artist', 'year'],
          playlist: [],
          show: [],
          episode: [],
          audiobook: []
        }
       
        return filterMap[category] ?? [];
    }

    function attachPagination(path: string, direction: PaginationDirection): string {
        const { offset, limit } = data

        let newOffset = offset;

        if (direction === 'next') {
            newOffset += limit;
        } else {
            newOffset -= limit;
        }

        path += `&offset=${newOffset}`;

        return path
    }

    async function search(paginationDirection?: PaginationDirection) {
        errorMessage = null;
        if (searchTerm.length == 0) {
            errorMessage = ('No search term');
        }

        let path = `/?type=${type}&search=${searchTerm}`;
        path = attachFilters(path);
        if (paginationDirection) {
            path = attachPagination(path, paginationDirection);
        }

        if (market && market.length) {
            path = `${path}&market=${market}`;
        }

        loading = true;
        await goto(path);
        loading = false;
    }

    function submitSearch() {
        return search();
    }

    function attachFilters(path: string): string {
        const hasFilters = moreFilters.length < availableFilters.length;
        if (!hasFilters) {
            return path;
        }

        return Object.entries(filters).reduce((acc, [type, value]) => {
            if (!value.length) {
                return acc;
            }

            return acc += `&${type}=${encodeURIComponent(value)}`;
        }, `${path}`);
    }

    function addFilter() {
        const filterType = nextFilter;
        if (!filterType) {
            return;
        }
        filters = {
            ...filters,
            [filterType]: '',
        }
        nextFilter = getNextFilter();
    }

    function removeFilter(attribute: FilterItem) {
        filters = omit(filters, [attribute]);
        nextFilter = getNextFilter();
    }

    function getNextFilter() {
        const firstAvailable = getFiltersForCategory()
            .filter(attr => !filters.hasOwnProperty(attr))
            .shift();
        return firstAvailable ?? defaultFilter;
    }

    function removeMarket() {
        market = null
    }

    function resetFilters() {
        filters = {};
        nextFilter = getNextFilter()
    }
</script>


<section class="container">
    <div class="container">
        <h1 class="mainTitle">Spotifind</h1>
    </div>
    {#if loading}
        <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
         </div>
    {:else}
        <form on:submit|preventDefault={submitSearch}>
            <div class="mb-3">
                <input bind:value={searchTerm} class="form-control" placeholder="Search">
            </div>
            <div class="mb-3 input-group">
                <label for="selectType" class="input-group-text">Category</label>
                <select id="selectType" class="form-control" on:change={resetFilters} bind:value={type}>
                    {#each allTypes as typeOption}
                        <option>{typeOption}</option>
                    {/each}
                </select>
            </div>

            <div class="mb-3 input-group">
                <label for="selectType" class="input-group-text">Market</label>
                <select id="selectType" class="form-control" bind:value={market}>
                    {#each countries as {code, name}}
                        <option value={code}>{name} ({code})</option>
                    {/each}
                </select>
                <IconButton iconClass="x-circle" on:click={removeMarket} />
            </div>

            <div class="mb-3">
                {#if moreFilters.length}
                    <label for="filter" class="form-label">Filter</label>
                    <div id="filter" class="input-group mb-3">
                        <select class="form-control" bind:value={nextFilter}>
                            {#each moreFilters as filterType}
                                <option>{filterType}</option>
                            {/each}
                        </select>
                        <IconButton iconClass="plus-circle" on:click={addFilter} />
                    </div>
                {/if}
                {#each filterAttributes as attr}
                    <div class="input-group input-group-sm mb-3">
                        <label class="input-group-text" for="{attr}">{attr}</label>
                        <input id="{attr}" bind:value={filters[attr]} type="text" class="form-control">
                        <IconButton iconClass="x-circle" on:click={() => removeFilter(attr)} />
                    </div>
                {/each}
            </div>

            <button type="submit" class="form-control btn btn-primary">Search</button>
        </form>
    {/if}

    <Error message={errorMessage} />

    <div class="container">
        {#each data.items as item}
        <Result result={item} /> 
    {/each}
    </div>

    {#if data.total > 0}
        <div class="container text-center">
            <div class="row">
                {#if data.offset && data.offset > 0}
                    <div class="col text-center">
                        <IconButton iconClass="arrow-left-circle" on:click={() => search('prev')} />
                    </div>
                {/if}
                {#if (data.offset ?? 0) < data.total}
                    <div class="col text-center">
                        <IconButton iconClass="arrow-right-circle" on:click={() => search('next')} />
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</section>

<style>
    .mainTitle {
        text-align: center;
        margin: 20px 0 50px 0;
    }
</style>