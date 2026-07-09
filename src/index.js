// quine-cube-runner-api · Express HTTP wrapper around quine-cube-runner-sdk · MIT · AI-Native Solutions
import express from 'express';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, tool: 'quine-cube-runner', version: '1.0.0' }));

app.post('/showToast', async (req, res) => {
  try {
    const { showToast } = await import('@ai-native-solutions/quine-cube-runner-sdk');
    const out = typeof showToast === 'function' ? await showToast(req.body) : { error: 'showToast not callable' };
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/updateStats', async (req, res) => {
  try {
    const { updateStats } = await import('@ai-native-solutions/quine-cube-runner-sdk');
    const out = typeof updateStats === 'function' ? await updateStats(req.body) : { error: 'updateStats not callable' };
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/paintCube', async (req, res) => {
  try {
    const { paintCube } = await import('@ai-native-solutions/quine-cube-runner-sdk');
    const out = typeof paintCube === 'function' ? await paintCube(req.body) : { error: 'paintCube not callable' };
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/detectLang', async (req, res) => {
  try {
    const { detectLang } = await import('@ai-native-solutions/quine-cube-runner-sdk');
    const out = typeof detectLang === 'function' ? await detectLang(req.body) : { error: 'detectLang not callable' };
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/runInSandbox', async (req, res) => {
  try {
    const { runInSandbox } = await import('@ai-native-solutions/quine-cube-runner-sdk');
    const out = typeof runInSandbox === 'function' ? await runInSandbox(req.body) : { error: 'runInSandbox not callable' };
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/run', async (req, res) => {
  try {
    const { run } = await import('@ai-native-solutions/quine-cube-runner-sdk');
    const out = typeof run === 'function' ? await run(req.body) : { error: 'run not callable' };
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('quine-cube-runner-api listening on :' + PORT));
