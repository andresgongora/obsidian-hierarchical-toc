<script lang="ts">
	import Note from "./Note.svelte";
	import { data, centered_id, centered_children } from './stores';

	const children: Record<string, Note> = {};

	export function focusTo(pathNotes: string[])
	{
		let first:string|undefined = pathNotes.shift();
		if(!first) return;
		if(!children[first]) return;
		children[first].focusNotes(pathNotes);
	}

</script>

{#if $data !== undefined && $centered_children}
	{#each $centered_children as child (child)}
		<Note type="sub_note" id="{child}" node_path={[child]} bind:this={children[child]} />
	{/each}
{/if}

