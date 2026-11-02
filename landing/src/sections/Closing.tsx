// Inverted closing screen: deep ink, white text, the same single button.
import Page from '../components/Page';

export default function Closing() {
  return (
    <Page tone="ink" id="closing" label="أوليف ووتش">
      <h2 id="closing-title" className="closing-title">
        كل زيتونة تهم
      </h2>
      <a className="btn" href="#demo">
        جرّب العرض
      </a>
    </Page>
  );
}
