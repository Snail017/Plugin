<template>
  <transition name="msgbox-fade">
    <div
      class="dialog message"
      tabindex="-1"
      v-show="visible"
      @click.self="handleWrapperClick"
      role="dialog"
    >
      <div class="bg"></div>
      <div class="pop_up">
        <h1 v-if="title" v-html="title"></h1>
        <div class="st_message" v-html="message"></div>
        <div class="el-message-box__btns">
          <button
            :loading="cancelButtonLoading"
            :class="[cancelButtonClasses]"
            class="button"
            v-if="showCancelButton"
            :round="roundButton"
            size="small"
            @click="handleAction('cancel')"
            @keydown.enter="handleAction('cancel')"
          >
            {{ cancelButtonText }}
          </button>
          <button
            :loading="confirmButtonLoading"
            ref="confirm"
            :class="[confirmButtonClasses]"
            class="button"
            v-show="showConfirmButton"
            :round="roundButton"
            size="small"
            @click="handleAction('confirm')"
            @keydown.enter="handleAction('confirm')"
          >
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
      <div
        v-show="false"
        class="el-message-box"
        :class="[customClass, center && 'el-message-box--center']"
      >
        <div class="el-message-box__header" v-if="title !== null">
          <div class="el-message-box__title">
            <div
              :class="['el-message-box__status', icon]"
              v-if="icon && center"
            ></div>
            <span>{{ title }}</span>
          </div>
          <button
            type="button"
            class="el-message-box__headerbtn button"
            v-if="showClose"
            @click="
              handleAction(distinguishCancelAndClose ? 'close' : 'cancel')
            "
            @keydown.enter="
              handleAction(distinguishCancelAndClose ? 'close' : 'cancel')
            "
          >
            <i class="el-message-box__close el-icon-close"></i>
          </button>
        </div>
        <div class="el-message-box__content">
          <div class="el-message-box__container">
            <div
              :class="['el-message-box__status', icon]"
              v-if="icon && !center && message !== ''"
            ></div>
            <div class="el-message-box__message" v-if="message !== ''">
              <slot>
                <p v-if="!dangerouslyUseHTMLString">{{ message }}</p>
                <p v-else v-html="message"></p>
              </slot>
            </div>
          </div>
        </div>
        <div class="el-message-box__btns">
          <button
            :loading="cancelButtonLoading"
            :class="[cancelButtonClasses]"
            class="button"
            v-if="showCancelButton"
            :round="roundButton"
            size="small"
            @click="handleAction('cancel')"
            @keydown.enter="handleAction('cancel')"
          >
            {{ cancelButtonText }}
          </button>
          <button
            :loading="confirmButtonLoading"
            ref="confirm"
            :class="[confirmButtonClasses]"
            class="button"
            v-show="showConfirmButton"
            :round="roundButton"
            size="small"
            @click="handleAction('confirm')"
            @keydown.enter="handleAction('confirm')"
          >
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
import Popup from "@/dialog/utils/popup";
import { addClass, removeClass } from "@/dialog/utils/dom";
import Dialog from "@/dialog/utils/aria-dialog";

let messageBox;
let typeMap = {
  success: "success",
  info: "info",
  warning: "warning",
  error: "error",
};

export default {
  mixins: [Popup],

  props: {
    modal: {
      default: true,
    },
    lockScroll: {
      default: true,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    closeOnClickModal: {
      default: true,
    },
    closeOnPressEscape: {
      default: true,
    },
    closeOnHashChange: {
      default: true,
    },
    center: {
      default: false,
      type: Boolean,
    },
    roundButton: {
      default: false,
      type: Boolean,
    },
  },

  computed: {
    icon() {
      const { type, iconClass } = this;
      return (
        iconClass || (type && typeMap[type] ? `el-icon-${typeMap[type]}` : "")
      );
    },

    confirmButtonClasses() {
      return `button--primary ${this.confirmButtonClass}`;
    },
    cancelButtonClasses() {
      return `${this.cancelButtonClass}`;
    },
  },

  methods: {
    getSafeClose() {
      const currentId = this.uid;
      return () => {
        this.$nextTick(() => {
          if (currentId === this.uid) this.doClose();
        });
      };
    },
    doClose() {
      if (!this.visible) return;
      this.visible = false;
      this._closing = true;

      this.onClose && this.onClose();
      messageBox.closeDialog(); // 解绑
      if (this.lockScroll) {
        setTimeout(this.restoreBodyStyle, 200);
      }
      this.opened = false;
      this.doAfterClose();
      setTimeout(() => {
        if (this.action) this.callback(this.action, this);
      });
    },

    handleWrapperClick() {
      if (this.closeOnClickModal) {
        this.handleAction(this.distinguishCancelAndClose ? "close" : "cancel");
      }
    },

    handleInputEnter() {
      if (this.inputType !== "textarea") {
        return this.handleAction("confirm");
      }
    },

    handleAction(action) {
      if (this.$type === "prompt" && action === "confirm" && !this.validate()) {
        return;
      }
      this.action = action;
      if (typeof this.beforeClose === "function") {
        this.close = this.getSafeClose();
        this.beforeClose(action, this, this.close);
      } else {
        this.doClose();
      }
    },

    validate() {
      if (this.$type === "prompt") {
        const inputPattern = this.inputPattern;
        if (inputPattern && !inputPattern.test(this.inputValue || "")) {
          this.editorErrorMessage =
            this.inputErrorMessage || t("el.messagebox.error");
          addClass(this.getInputElement(), "invalid");
          return false;
        }
        const inputValidator = this.inputValidator;
        if (typeof inputValidator === "function") {
          const validateResult = inputValidator(this.inputValue);
          if (validateResult === false) {
            this.editorErrorMessage =
              this.inputErrorMessage || t("el.messagebox.error");
            addClass(this.getInputElement(), "invalid");
            return false;
          }
          if (typeof validateResult === "string") {
            this.editorErrorMessage = validateResult;
            addClass(this.getInputElement(), "invalid");
            return false;
          }
        }
      }
      this.editorErrorMessage = "";
      removeClass(this.getInputElement(), "invalid");
      return true;
    },
    getFirstFocus() {
      const btn = this.$el.querySelector(".el-message-box__btns .button");
      const title = this.$el.querySelector(
        ".el-message-box__btns .el-message-box__title"
      );
      return btn || title;
    },
    getInputElement() {
      const inputRefs = this.$refs.input.$refs;
      return inputRefs.input || inputRefs.textarea;
    },
    handleClose() {
      this.handleAction("close");
    },
  },

  watch: {
    inputValue: {
      immediate: true,
      handler(val) {
        this.$nextTick((_) => {
          if (this.$type === "prompt" && val !== null) {
            this.validate();
          }
        });
      },
    },

    visible(val) {
      if (val) {
        this.uid++;
        if (this.$type === "alert" || this.$type === "confirm") {
          this.$nextTick(() => {
            // this.$refs.confirm.$el.focus();
          });
        }
        this.focusAfterClosed = document.activeElement;
        messageBox = new Dialog(
          this.$el,
          this.focusAfterClosed,
          this.getFirstFocus()
        );
      }

      // prompt
      if (this.$type !== "prompt") return;
      if (val) {
        setTimeout(() => {
          if (this.$refs.input && this.$refs.input.$el) {
            this.getInputElement().focus();
          }
        }, 500);
      } else {
        this.editorErrorMessage = "";
        removeClass(this.getInputElement(), "invalid");
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      if (this.closeOnHashChange) {
        window.addEventListener("hashchange", this.close);
      }
    });
  },

  beforeDestroy() {
    if (this.closeOnHashChange) {
      window.removeEventListener("hashchange", this.close);
    }
    setTimeout(() => {
      messageBox.closeDialog();
    });
  },

  data() {
    return {
      uid: 1,
      title: undefined,
      message: "",
      type: "",
      iconClass: "",
      customClass: "",
      showInput: false,
      inputValue: null,
      inputPlaceholder: "",
      inputType: "text",
      inputPattern: null,
      inputValidator: null,
      inputErrorMessage: "",
      showConfirmButton: true,
      showCancelButton: false,
      action: "",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      confirmButtonLoading: false,
      cancelButtonLoading: false,
      confirmButtonClass: "",
      confirmButtonDisabled: false,
      cancelButtonClass: "",
      editorErrorMessage: null,
      callback: null,
      dangerouslyUseHTMLString: false,
      focusAfterClosed: null,
      isOnComposition: false,
      distinguishCancelAndClose: false,
    };
  },
};
</script>
<style lang="scss" scoped>
.message {
  text-align: right;
  .bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    opacity: 0.6;
    z-index: 10000;
  }

  .pop_up {
    position: fixed;
    left: 50%;
    margin-left: rem(-320/2);
    width: rem(300);
    z-index: 10001;
    top: 30%;
    border-radius: rem1(20);
    background-color: #fff;
    color: #191a27;
    h1 {
      font-size: 18px;
      font-weight: 500;
      color: #000000;
      line-height: 20px;
      text-align: center;
      margin-bottom: rem(10);
      margin: rem(10);
    }
    .st_message {
      line-height: rem1(58);
      margin: rem(10);
      font-size: rem1(30);
      text-align: center;
    }
    button {
      display: block;
      width: 100%;
      font-size: 15px;
      font-weight: 500;
      color: #3492fc;
      line-height: 21px;
      border: none;
      background: transparent;
      border-top: 1px solid #eeeeee;
      padding: rem(10);
    }
  }
}
</style>

