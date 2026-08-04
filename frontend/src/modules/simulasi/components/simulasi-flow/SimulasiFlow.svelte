<script lang="ts">
  import { client } from '@shared/utils/graphql';

  let logs = $state<string[]>([]);
  let running = $state(false);
  let result = $state<any>(null);

  function addLog(msg: string) { logs = [...logs, `[${new Date().toLocaleTimeString()}] ${msg}`]; }

  async function runSimulation() {
    running = true;
    logs = [];
    result = null;

    try {
      addLog('📝 Mendaftarkan user...');
      const reg = await client.mutation(`mutation($input: user__RegisterRequest_Input) {
        user_UserService_Register(input: $input) { user { id email } token }
      }`, { input: { email: `sim-${Date.now()}@test.com`, username: 'sim', password: 'test123' } }).toPromise();
      const userId = reg.data?.user_UserService_Register?.user?.id;
      addLog('✅ User: ' + userId?.slice(0, 8) + '...');

      addLog('🔍 NLP Analyze...');
      const nlp = await client.mutation(`mutation($input: nlp__AnalyzeTextRequest_Input) {
        nlp_NLPService_AnalyzeText(input: $input) { label confidence extracted_address paraphrased_text }
      }`, { input: { text: 'ada pohon tumbang di Jl. Sudirman' } }).toPromise();
      const nlpData = nlp.data?.nlp_NLPService_AnalyzeText;
      if (!nlpData) { addLog('❌ NLP gagal: ' + JSON.stringify(nlp.error)); return; }
      addLog('✅ NLP: ' + nlpData.label + ' (' + (nlpData.confidence * 100).toFixed(0) + '%)');
      addLog('📍 Alamat: ' + (nlpData.extracted_address || '(tidak ditemukan)'));

      addLog('⛓️ Blockchain record...');
      const bc = await client.mutation(`mutation($input: blockchain__RecordClassificationRequest_Input) {
        blockchain_BlockchainService_RecordClassification(input: $input) { block { index hash } success }
      }`, { input: {
        tweet_id: 'sim-' + Date.now(), label: nlpData.label,
        confidence: nlpData.confidence, image_hash: 'sha256:sim',
        location: { lat: -6.2, lon: 106.8, address: 'Jl. Sudirman' }
      } }).toPromise();
      const bcData = bc.data?.blockchain_BlockchainService_RecordClassification;
      addLog('✅ Block #' + bcData?.block?.index + ' hash=' + (bcData?.block?.hash?.slice(0,12) || '') + '...');

      addLog('🔐 Verifikasi chain...');
      const ver = await client.mutation(`mutation { blockchain_BlockchainService_VerifyChain { valid blocks_count } }`).toPromise();
      const verData = ver.data?.blockchain_BlockchainService_VerifyChain;
      addLog('✅ Chain: valid=' + verData?.valid + ' total=' + verData?.blocks_count + ' blocks');

      result = { success: true };
      addLog('🎯 Simulasi berhasil!');
    } catch (e: any) {
      addLog('❌ Error: ' + e.message);
      result = { success: false, error: e.message };
    } finally {
      running = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="border-2 border-border rounded-base bg-secondary-background shadow-shadow p-6">
    <h2 class="text-2xl font-heading mb-4">Simulasi Flow Ecoguard</h2>
    <p class="mb-4 text-muted-foreground">Test end-to-end dari register sampai blockchain</p>
    <button onclick={runSimulation} disabled={running}
      class="border-2 border-border rounded-base shadow-shadow bg-main text-main-foreground px-6 py-3 font-heading text-lg hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none disabled:opacity-50 transition-all">
      {running ? 'Menjalankan...' : '▶ Jalankan Simulasi'}
    </button>
  </div>

  {#if logs.length > 0}
    <div class="border-2 border-border rounded-base bg-black text-green-400 p-4 font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
      {#each logs as log}
        <div>{log}</div>
      {/each}
    </div>
  {/if}

  {#if result}
    <div class="border-2 border-border rounded-base bg-secondary-background shadow-shadow p-4">
      <p class="font-heading text-lg">{result.success ? '✅ Berhasil' : '❌ Gagal'}</p>
    </div>
  {/if}
</div>
