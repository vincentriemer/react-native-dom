<style>
  :host {
    display: contents;
  }
  .redbox {
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background: rgb(204, 0, 0);
    color: white;
    z-index: 2147483647;
    text-align: left;
    font-size: 16px;
    line-height: 1.2;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    overflow: hidden;
  }
  .error {
    padding-top: 20px;
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 10px;
    flex: 1;
    overflow: auto;
    overscroll-behavior: contain;
  }
  .message {
    margin-top: 10px;
    font-size: 1.2em;
    white-space: pre-wrap;
  }
  .stack {
    flex: 1;
    margin-top: 2em;
    display: flex;
    flex-direction: column;
  }
  .frame {
    cursor: pointer;
    font-family: monospace;
    display: block;
    font-size: 1em;
    color: white;
    text-align: left;
    padding-top: 1em;
    padding-bottom: 1em;
    background: none;
    border: none;
    transition: opacity 0.2s;
    flex-shrink: 0;
  }
  .frame:active {
    opacity: 0.4;
  }
  .file {
    font-size: 0.8em;
    color: rgba(255, 255, 255, 0.7);
    word-break: break-all;
  }
  .buttons {
    height: 60px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }
  .button {
    cursor: pointer;
    font-size: 1em;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    flex: 1;
  }
  .button:active {
    color: rgba(255, 255, 255, 1);
  }
</style>

<div class="redbox">
  <div class="error">
    <div class="message">{message}</div>
    <div class="stack">
      {#each stack as entry}
        <button class="frame" on:click="onStackFrame(entry)">
          <div>{entry.methodName}</div>
          <div class="file">
            {entry.file}:{entry.lineNumber}:{entry.column}
          </div>
        </button>
      {/each}
    </div>
  </div>
  <div class="buttons">
    <button on:click="onDismiss()" class="button">Dismiss</button>
    <button on:click="onReload()" class="button">Reload JS</button>
    <button on:click="onCopy()" class="button">Copy</button>
  </div>
</div>

<script>
  export default {
    tag: "rndom-redbox",
    data() {
      return {
        message: "",
        stack: []
      };
    },
    methods: {
      onStackFrame(frame) {
        this.dispatchEvent(new CustomEvent("stackframe", { detail: frame }));
      },
      onDismiss() {
        this.dispatchEvent(new CustomEvent("dismiss"));
      },
      onReload() {
        this.dispatchEvent(new CustomEvent("reload"));
      },
      onCopy() {
        this.dispatchEvent(new CustomEvent("copy"));
      }
    }
  };
</script>