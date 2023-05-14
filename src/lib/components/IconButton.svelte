<script lang="ts">
    export let iconClass: string;
</script>

<a class="icon input-group-text" on:click>
    <svg width="20" height="20" fill="currentColor">
        <use xlink:href="/icons/bootstrap-icons.svg#{iconClass}"/>
    </svg>
</a>


<style>
    a.icon {
        cursor: pointer;
    }
    a.icon>svg {
        margin: 0 auto;
    }
</style>