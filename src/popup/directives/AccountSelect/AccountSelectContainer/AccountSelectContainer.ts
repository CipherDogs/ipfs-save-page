import { EventBus, ACCOUNT_SELECT_HIDE, ACCOUNT_SELECT_PREVENT_CLOSE, ACCOUNT_SELECT_SHOW, ACCOUNT_SELECT_ITEM } from '../../../../services/events';
import { AppWallet, StorageVars } from '../../../../services/data';
const _ = require('lodash');

export default {
  name: 'account-select-container',
  template: require('./AccountSelectContainer.html'),
  props: [],
  components: {},
  mounted() {
    this.$refs.container.addEventListener('click', () => {
      EventBus.$emit(ACCOUNT_SELECT_PREVENT_CLOSE, { uniqId: this.uniqId });
    });

    EventBus.$on(ACCOUNT_SELECT_SHOW, config => {
      this.uniqId = config.uniqId;

      this.showContainer = true;
      // this.value = config.value || {};
      // this.localValue = this.value;

      let inputOffset = this.getElOffset(config.input);
      this.top = inputOffset.top + this.getElHeight(config.input) + 5 + 'px';
      this.left = inputOffset.left + 'px';

      const drawer = document.querySelectorAll('.md-app-drawer');
      if (drawer && drawer.length) {
        this.left = inputOffset.left - this.getElWidth(drawer[0]) + 'px';
      }

      // this.width = this.getElWidth(config.input) + 'px';
    });

    EventBus.$on(ACCOUNT_SELECT_HIDE, config => {
      if (this.uniqId != config.uniqId) {
        return;
      }
      this.uniqId = null;
      this.showContainer = false;
    });
  },
  methods: {
    getElOffset(el) {
      const rect = el.getBoundingClientRect();
      const docEl = document.documentElement;

      const top = rect.top + window.pageYOffset - docEl.clientTop;
      const left = rect.left + window.pageXOffset - docEl.clientLeft;
      return { top, left };
    },
    getElHeight(el) {
      return el.offsetHeight;
    },
    getElWidth(el) {
      return el.offsetWidth;
    },
    preventClose() {
      EventBus.$emit(ACCOUNT_SELECT_PREVENT_CLOSE, { uniqId: this.uniqId });
    },
    selectAccountByIndex(index) {
      EventBus.$emit(ACCOUNT_SELECT_ITEM, { uniqId: this.uniqId, account: this.accountList[index] });
      this.$router.push(this.currentCabinet);
    },
    async deleteAccount(account) {
      await AppWallet.deleteAccount(StorageVars.CyberDAccounts, account.address);
      this.$store.commit(StorageVars.CurrentAccounts, this.$store.state[StorageVars.CyberDAccounts]);
      if (this.accountListDisplay.length == 0) {
        this.$router.push('/new-wallet/welcome');
      } else {
        this.selectAccountByIndex(0);
      }
    },
  },
  watch: {},
  computed: {
    currentAccount() {
      return this.$store.state[StorageVars.Account];
    },
    accountList() {
      return this.$store.state[StorageVars.CurrentAccounts] || [];
    },
    accountListDisplay() {
      return this.accountList.map(account => {
        account = _.clone(account);
        // account.prettyAddress = EthData.cutHex(account.address);
        account.prettyAddress = account.address;
        return account;
      });
    },
    currentCabinet() {
      return this.$store.state[StorageVars.CurrentCabinetRoute];
    },
  },
  data: function() {
    return {
      showContainer: false,
      top: '0px',
      left: '0px',
      // width: '0px',
      uniqId: null,
    };
  },
};
