const _ = require('lodash');
import { AppWallet, StorageVars } from '../../../../../services/data';
import { CyberD } from '../../../../../services/cyberd';
import { addIpfsContentArray, saveContent } from '../../../../../services/backgroundGateway';

const pIteration = require('p-iteration');

export default {
  template: require('./SaveAndLinkContent.html'),
  created() {
    this.inputDescription = this.$route.query.description;
    this.size = this.$route.query.size;
  },
  methods: {
    async saveAndLink() {
      await saveContent({
        contentHash: this.resultContentHash,
        size: this.size,
        description: this.inputDescription,
        keywords: this.resultKeywords,
        mimeType: this.$route.query.mimeType,
      });

      this.$notify({
        type: 'success',
        text: 'Successfully saved and linked',
      });
      this.$router.push({ name: 'cabinet-cyberd' });

      // try {
      //   const keywordHashes = await addIpfsContentArray(this.resultKeywords);

      //   const results = await pIteration.mapSeries(keywordHashes, async keywordHash => {
      //     return CyberD.link(
      //       {
      //         address: this.currentAccount.address,
      //         privateKey: await AppWallet.decryptByPassword(this.currentAccount.encryptedPrivateKey),
      //       },
      //       keywordHash,
      //       this.resultContentHash
      //     );
      //   });

      //   console.log('link results', results);

      //   this.$notify({
      //     type: 'success',
      //     text: 'Successfully saved and linked',
      //   });
      //   this.$router.push({ name: 'cabinet-cyberd' });
      // } catch (e) {
      //   this.$notify({
      //     type: 'error',
      //     title: e && e.message ? e.message : e || 'Unknown error',
      //     text: e && e.data ? e.data : '',
      //   });
      // }
    },
  },
  computed: {
    resultContentHash() {
      return this.contentHash || this.inputContentHash;
    },
    resultKeywords() {
      return this.inputKeywordsStr.split(/[ ,]+/);
    },
    contentHash() {
      return this.$route.query.contentHash;
    },
    keywords() {
      return _.isArray(this.$route.query.keywords) ? this.$route.query.keywords : this.$route.query.keywords ? this.$route.query.keywords.split(/[ ,]+/) : null;
    },
    keywordsStr() {
      return this.keywords ? this.keywords.join(', ') : '';
    },
    currentAccount() {
      return this.$store.state[StorageVars.Account];
    },
    disableSaveAndLink() {
      // return !(this.contentHash || this.inputContentHash) || !(this.keywordsStr || this.inputKeywordsStr);
      return !(this.contentHash || this.inputContentHash);
    },
  },
  watch: {
    // async resultContentHash() {
    //   this.size = ((await getIpfsFileStats(this.resultContentHash)) as any).size || 0;
    // }
  },
  data() {
    return {
      inputContentHash: '',
      inputDescription: '',
      inputKeywordsStr: '',
    };
  },
};
