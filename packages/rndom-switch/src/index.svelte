<style>
	.checkbox {
	  display: none;
	}

	.toggle {
	  box-sizing: border-box;
	  position: relative;
	  z-index: 2;
	  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
	  touch-action: manipulation;
	}

	.background-on {
	  position: absolute;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	}

	.background-off {
	  position: absolute;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  transition: opacity 0.1s ease-out;
	  will-change: opacity;
	}

	.background-off-inner {
	  position: absolute;
	  top: 2px;
	  left: 2px;
	  right: 2px;
	  bottom: 2px;
	  background-color: #ccc;
	  will-change: transform, opacity;
	  transition: transform 0.35s, opacity 0.35s;
	}

	.handle {
	  position: absolute;
	  top: 2px;
	  left: 2px;
	  will-change: transform;
	  transition: transform 0.35s;
	}
</style>

<div 
	class="toggle" 
	on:click="toggle()"
	style="
		width: {width}px; 
		height: {height}px; 
		opacity: {disabled ? 0.5 : 1};
		pointer-events: {disabled ? 'none' : 'auto'};
	"
>
	<input class="checkbox" type="checkbox" bind:value=value />
	<div 
		class="background-on" 
		style="
			border-radius: {height / 2}px;
			background-color: {onTintColor};
		"
	></div>
	<div 
		class="background-off" 
		style="
			opacity: {value ? 0 : 1};
			border-radius: {height / 2}px;
			background-color: {tintColor};
		"
	></div>
	<div 
		class="background-off-inner" 
		style="
			transform: scale({value ? 0 : 1});
			opacity: {value ? 0 : 1};
			border-radius: {(height - 4) / 2}px;
		"
	></div>
	<div 
		class="handle" 
		style="
			width: {height - 4}px;
			height: {height - 4}px;
			background-color: {thumbTintColor};
			border-radius: {(height - 4) / 2}px;
			transform: translateX({ value ? `${width - height}px` : `0px` });
		"
	></div>
</div>

<script>
			export default {
			  tag: "rndom-switch",
			  data: () => ({
			    disabled: false,
			    value: false,
			    width: 51,
			    height: 31,
			    tintColor: "#aaa",
			    onTintColor: "#007bff",
			    thumbTintColor: "#fff"
			  }),
			  methods: {
			    toggle() {
			      const event = new CustomEvent("change", {
			        detail: { value: !this.value }
			      });

			      if (this.dispatchEvent(event)) {
			        this.set({ value: !this.value });
			      }
			    }
			  }
			};
</script>