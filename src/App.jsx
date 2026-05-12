import { useState } from 'react';
import Ayush_portfolio from './Ayush_portfolio';
import BlockLoader from './BlockLoader';

function App() {
  // `true` on every mount (fresh load / refresh) so the counter + cascade
  // intro plays every time someone lands on the site.
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Ayush_portfolio loaderDone={!loading} />
      {loading && <BlockLoader onComplete={() => setLoading(false)} />}
    </>
  );
}

export default App;
