<input
	type="range"
	style="
		width: {width}px; 
		height: {height}px; 
		opacity: {disabled ? 0.5 : 1};
		pointer-events: {disabled ? 'none' : 'auto'};
	"
	bind:value=value
	on:input="input()"
	on:change="change()"
	on:touchend="touchEnd(event)"
	on:mouseup="mouseUp()"
	min="{minimumValue}"
	max="{maximumValue}"
	step="{step || "any"}"
	disabled="{disabled}"
/>

<script>
	export default {
	  tag: "rndom-slider",
	  data: () => ({
	    disabled: false,
	    value: 0,
	    maximumValue: 1,
	    minimumValue: 0,
	    step: 0
	  }),
	  methods: {
	    input() {
	      const event = new CustomEvent("valueChange", {
	        detail: { value: this.value }
	      });

	      if (this.dispatchEvent(event)) {
	        this.set({ value: this.value });
	      }
	    },
	    change() {
	      this.emitSlidingComplete();
	    },
	    touchEnd(e) {
	      e.preventDefault();
	      this.emitSlidingComplete();
	    },
	    mouseUp() {
	      this.emitSlidingComplete();
	    },
	    emitSlidingComplete() {
	      const event = new CustomEvent("slidingComplete", {
	        detail: { value: this.value }
	      });

	      this.dispatchEvent(event);
	    }
	  }
	};
</script>