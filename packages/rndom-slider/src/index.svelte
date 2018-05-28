<style type="text/less">
  @thumb-diameter: 20px;

  @track-height: 2px;
  @track-bg: #dee2e6;
  @track-border-radius: @thumb-diameter / 2;
  @track-box-shadow: inset 0 4px 4px fade(black, 10);

  .appearance-none() {
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .thumb() {
    width: @thumb-diameter;
    height: @thumb-diameter;

    background: var(--slider-thumb-tint)
      linear-gradient(
        180deg,
        var(--slider-thumb-tint-lighter),
        var(--slider-thumb-tint)
      )
      repeat-x;

    border: 0;
    border-radius: @thumb-diameter / 2;
    box-shadow: 0 1.6px 4px fade(black, (0.1 * 100));
    transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
    .appearance-none();
  }

  .thumb-focus() {
    outline: none;
    box-shadow: 0 0 0 1px white, 0 0 0 3.2px var(--slider-thumb-focus-color);
  }

  .thumb-active() {
    background: var(--slider-thumb-tint-active)
      linear-gradient(
        180deg,
        var(--slider-thumb-tint-active-lighter),
        var(--slider-thumb-tint-active)
      )
      repeat-x;
  }

  .track() {
    width: 100%;
    height: @track-height;
    color: transparent;
    cursor: pointer;
    box-shadow: @track-box-shadow;
  }

  .slider {
    width: 100%;
    padding-left: 0; // Firefox specific
    background-color: transparent;
    .appearance-none();

    &:focus {
      outline: none;
      &::-webkit-slider-thumb {
        .thumb-focus();
      }

      &::-moz-range-thumb {
        .thumb-focus();
      }
    }

    &::-moz-focus-outer {
      border: 0;
    }

    &::-webkit-slider-thumb {
      .thumb();
      margin-top: (0.5 * @track-height - 0.5 * @thumb-diameter);

      &:active {
        .thumb-active();
      }
    }

    &::-webkit-slider-runnable-track {
      .track();
      background-color: @track-bg;
      border-color: transparent;
      border-radius: @track-border-radius;
    }

    &::-moz-range-thumb {
      .thumb();

      &:active {
        .thumb-active();
      }
    }

    &::-moz-range-track {
      .track();

      background-color: @track-bg;
      border-color: transparent; // Firefox specific?
      border-radius: @track-border-radius;
    }

    &::-ms-thumb {
      .thumb();

      &:focus {
        .thumb-focus();
      }

      &:active {
        .thumb-active();
      }
    }

    &::-ms-track {
      .track();
      background-color: transparent;
      border-color: transparent;
      border-width: (@thumb-diameter * 0.5);
    }

    &::-ms-fill-lower {
      background-color: @track-bg;
      border-radius: @track-border-radius;
    }

    &::-ms-fill-upper {
      margin-right: 15px; // arbitrary?
      background-color: @track-bg;
      border-radius: @track-border-radius;
    }
  }
</style>

<input
	type="range"
	class="slider"
	style="
		width: {width}px; 
		height: {height}px; 
		opacity: {disabled ? 0.5 : 1};
		pointer-events: {disabled ? 'none' : 'auto'};
		--slider-thumb-tint: {thumbTintColor};
		--slider-thumb-tint-lighter: {thumbTintColorLighter};
		--slider-thumb-tint-active: {thumbTintColorActive};
		--slider-thumb-tint-active-lighter: {thumbTintColorActiveLighter};
		--slider-thumb-focus-color: {thumbFocusColor};
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
	import Color from "color";

	export default {
	  tag: "rndom-slider",
	  data: () => ({
	    disabled: false,
	    value: 0,
	    maximumValue: 1,
	    minimumValue: 0,
	    step: 0,
	    width: 0,
	    height: 0,
	    thumbTintColor: "#007bff"
	  }),
	  computed: {
	    thumbTintColorLighter: ({ thumbTintColor }) =>
	      Color(thumbTintColor)
	        .whiten(0.15)
	        .rgb()
	        .string(),

	    thumbTintColorActive: ({ thumbTintColor }) =>
	      Color(thumbTintColor)
	        .lightness(35 + Color(thumbTintColor).lightness())
	        .rgb()
	        .string(),

	    thumbTintColorActiveLighter: ({ thumbTintColor }) =>
	      Color(thumbTintColor)
	        .lightness(35 + Color(thumbTintColor).lightness())
	        .mix(Color("white"), 0.15)
	        .rgb()
	        .string(),

	    thumbFocusColor: ({ thumbTintColor }) =>
	      Color(thumbTintColor)
	        .alpha(0.25)
	        .rgb()
	        .string()
	  },
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