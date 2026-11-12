import type { Metadata } from "next";
import { Gabarito, Onest, Sometype_Mono } from "next/font/google";
import Link from "next/link";
import "./welcome.css";

const gabarito = Gabarito({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-gabarito" });
const onest = Onest({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-onest" });
const sometype = Sometype_Mono({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-sometype" });

export const metadata: Metadata = {
  title: "Suki: one campaign, a different idea for every account",
  description: "Suki turns one client campaign into a separate creative direction for each account you run. It checks the ideas against each other and every claim against what the brand approved.",
};

// The icon file has clear corners, so it sits cleanly on any background.
function Mark({ size }: { size: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="wl-mark" src="/icon.png" alt="" width={size} height={size} />;
}

const FAQ: [string, string][] = [
  ["Can't I just do this with ChatGPT?", "ChatGPT writes one post at a time. It doesn't know about your other accounts. Suki sees the whole portfolio, so it can tell when two accounts are about to say the same thing."],
  ["Does it pull live trends from Instagram?", "No. It works from trend references your team adds or picks. Each one shows its dated proof. Suki labels what was actually seen and what it guessed."],
  ["Could a bad claim get my client in trouble?", "Every line is checked against the client's approved claims. Anything stronger gets flagged. A person approves every idea before it's final."],
  ["Does it make the videos or post them?", "It writes the concepts, hooks, scripts and storyboards. Video depends on the tools and footage you give it. It doesn't post for you yet."],
  ["Will it get us more views?", "No tool can promise that. Suki makes sure each account brings a different idea. Your results show which ideas won, and those lessons go into the next round."],
];

// All product content below is the demo workspace's sample data (Lust Minerals 4D Hyaluronic Acid Serum).
export default function Welcome() {
  return (
    <div className={`wl ${gabarito.variable} ${onest.variable} ${sometype.variable}`}>
      <header className="wl-nav">
        <div>
          <Link href="/" className="wl-logo">
            <Mark size={28} />
            suki
          </Link>
          <nav className="wl-links" aria-label="Sections">
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <Link href="/campaigns" className="wl-btn">
            Open workspace
          </Link>
        </div>
      </header>

      <section className="wl-hero">
        <div className="wl-sky" aria-hidden="true" />
        <div className="wl-in">
          <div className="wl-head">
            <h1>
              One campaign<i className="d1">.</i> A different idea for every account<i className="d2">.</i>
            </h1>
            <span className="wl-cursor c1" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="16" height="16"><path d="M2 2l12 5-5 1.6L7.4 14z" /></svg>
              <b>@studentfinds</b>
            </span>
            <span className="wl-cursor c2" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="16" height="16"><path d="M2 2l12 5-5 1.6L7.4 14z" /></svg>
              <b>@beautyfinds</b>
            </span>
          </div>
          <p className="wl-sub">Suki turns one client campaign into a separate creative direction for each account you run. It checks the ideas against each other. It checks every claim against what the brand approved.</p>

          <form className="wl-brief" action="/campaigns/new" method="get">
            <label htmlFor="wl-brief-in" className="sr-only">
              Campaign brief
            </label>
            <textarea id="wl-brief-in" name="objective" rows={2} maxLength={500} placeholder="Describe your campaign or paste a brief" />
            <div className="wl-brief-row">
              <a href="#sample" className="wl-link">
                See a sample campaign
              </a>
              <button type="submit" className="wl-btn">
                Plan campaign
              </button>
            </div>
          </form>

          <div className="wl-win" id="sample">
            <input type="radio" name="wl-tab" id="wl-t1" defaultChecked />
            <input type="radio" name="wl-tab" id="wl-t2" />
            <input type="radio" name="wl-tab" id="wl-t3" />
            <div className="wl-bar">
              <span className="wl-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <div className="wl-tabs">
                <label htmlFor="wl-t1">Review</label>
                <label htmlFor="wl-t2">Playbooks</label>
                <label htmlFor="wl-t3">Brand Brain</label>
              </div>
              <span className="wl-mono wl-muted" style={{ textAlign: "right" }}>
                Sample campaign
              </span>
            </div>

            <div className="wl-pane wl-p1">
              <div className="wl-frames">
                <div className="wl-frame">
                  <small>@studentfinds</small>
                  <b>POV: it&apos;s 7:52, class is at 8, skin still asleep</b>
                </div>
                <div className="wl-frame b sel">
                  <small>@momessentials</small>
                  <b>My 5-minute reset before the kids wake up</b>
                </div>
                <div className="wl-frame c">
                  <small>@beautyfinds</small>
                  <b>Let&apos;s read this ingredient list together</b>
                </div>
              </div>
              <div className="wl-detail">
                <span className="wl-mono wl-muted">Mom Essentials · Instagram · Routine</span>
                <h3>My 5-minute reset before the kids wake up</h3>
                <div className="wl-check">
                  <span className="wl-st warn">Needs a fix</span>
                  <span>
                    Says “<del>instantly plumps your skin</del>.” Approved: “<ins>helps instantly plump the appearance of dehydrated skin</ins>.”
                  </span>
                </div>
                <div className="wl-acts">
                  <span className="wl-chip ink">Apply fix</span>
                  <span className="wl-chip">Request changes</span>
                </div>
              </div>
            </div>

            <div className="wl-pane wl-p2 wl-rows">
              <div>
                <span>
                  <b>Student Finds</b> <span className="wl-muted">· Casual, funny, talks like a classmate</span>
                </span>
                <span className="wl-st ok">Written</span>
              </div>
              <div>
                <span>
                  <b>Mom Essentials</b> <span className="wl-muted">· Warm, helpful, honest about the chaos</span>
                </span>
                <span className="wl-st ok">Written</span>
              </div>
              <div>
                <span>
                  <b>Beauty Finds</b> <span className="wl-muted">· Excited, informative, a little nerdy</span>
                </span>
                <span className="wl-st suki">Suki is drafting</span>
              </div>
            </div>

            <div className="wl-pane wl-p3">
              <div className="wl-rows">
                <span className="wl-mono wl-muted">Can say</span>
                <div>Lightweight, fast-absorbing formula</div>
                <div>Apply to damp skin, then follow with moisturiser</div>
                <div>Instant hydration and visible glow</div>
              </div>
              <div className="wl-rows">
                <span className="wl-mono wl-muted">Can&apos;t say</span>
                <div>
                  Clinically proven <span className="wl-st bad">Blocks a concept</span>
                </div>
                <div>
                  Reduces wrinkles or fine lines <span className="wl-st bad">Blocks a concept</span>
                </div>
                <div>
                  Dermatologist recommended <span className="wl-st bad">Blocks a concept</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wl-sec">
        <div className="wl-in wl-prose">
          <h2>Same product. Same hook. Nine profile pictures.</h2>
          <p>You run a portfolio of accounts. Each one has its own audience and its own voice. Then a client campaign lands.</p>
          <p>The product goes out to every account. Hooks get recycled. A trend gets copied because it worked last week. By the end of the month your accounts sound like one account wearing different profile pictures.</p>
          <p>Followers notice. So do clients.</p>
          <p className="wl-strong">The hard part was never making more content. It&apos;s deciding what each account should make.</p>
        </div>
      </section>

      <section className="wl-sec" id="how">
        <div className="wl-in">
          <h2>Suki picks the angle before anyone hits record</h2>
          <ol className="wl-how">
            <li>
              <div className="wl-art a">
                <div className="wl-card">“Show the serum as one quick, easy step in very different daily routines.”</div>
                <div className="wl-card">
                  <span>4D Hyaluronic Acid Serum</span>
                  <span className="wl-chip">Organic</span>
                </div>
                <div className="wl-card">
                  <span>3 accounts selected</span>
                  <span className="wl-chip ink">Create campaign</span>
                </div>
              </div>
              <div className="txt">
                <span className="wl-mono">01</span>
                <h3>Write one brief</h3>
                <p className="wl-muted">Give Suki the client, the product and the accounts you manage.</p>
              </div>
            </li>
            <li>
              <div className="wl-art b">
                <div className="wl-frames">
                  <div className="wl-frame">
                    <small>@studentfinds</small>
                    <b>7:52, class at 8</b>
                  </div>
                  <div className="wl-frame b">
                    <small>@momessentials</small>
                    <b>5-minute reset</b>
                  </div>
                  <div className="wl-frame c">
                    <small>@beautyfinds</small>
                    <b>Read the label</b>
                  </div>
                </div>
              </div>
              <div className="txt">
                <span className="wl-mono">02</span>
                <h3>Each account gets its own idea</h3>
                <p className="wl-muted">One serum becomes three stories. Each has its own angle, hook and script.</p>
              </div>
            </li>
            <li>
              <div className="wl-art c">
                <div className="wl-card">
                  <span>Voice matches the account</span>
                  <span className="wl-st ok">Pass</span>
                </div>
                <div className="wl-card">
                  <span>Stronger than the approved claim</span>
                  <span className="wl-st warn">Fix</span>
                </div>
                <div className="wl-card">
                  <span>“Reduces fine lines”</span>
                  <span className="wl-st bad">Blocked</span>
                </div>
              </div>
              <div className="txt">
                <span className="wl-mono">03</span>
                <h3>You review and sign</h3>
                <p className="wl-muted">Flagged lines show the approved wording. You sign once every idea passes.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="wl-sec">
        <div className="wl-in">
          <h2>What changes for your team</h2>
          <ul className="wl-feat">
            <li>
              <h3>Every account keeps its voice</h3>
              <p className="wl-muted">Each account stores its audience, tone, content pillars and past hooks. Two accounts can share a buyer and still sound nothing alike.</p>
            </li>
            <li>
              <h3>Overlap gets caught before production</h3>
              <p className="wl-muted">Suki compares hooks and angles across the whole campaign and against past posts. When two ideas are too close, it shows the words they share.</p>
            </li>
            <li>
              <h3>Clients only see claims they approved</h3>
              <p className="wl-muted">The Brand Brain holds approved and banned claims. If a line goes further than the brand&apos;s wording, Suki flags it and shows the approved version beside it.</p>
            </li>
            <li>
              <h3>Trends become playbooks</h3>
              <p className="wl-muted">Pick a trend reference. Suki explains why it fits this client. Then it turns the trend into an angle, a hook and a call to action. Every trend shows the dated proof behind it.</p>
            </li>
          </ul>
          <div className="wl-proof">
            <p>
              <b>Try the sample campaign.</b> One serum. Three accounts. Watch Suki catch a claim that goes too far and fix it with the brand&apos;s own wording.
            </p>
            <a href="#sample" className="wl-btn ghost">
              See a sample campaign
            </a>
          </div>
        </div>
      </section>

      <section className="wl-sec" id="faq">
        <div className="wl-in">
          <h2>Questions studios ask</h2>
          <div className="wl-faq">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p className="wl-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="wl-in">
        <section className="wl-end">
          <Mark size={64} />
          <h2>Ten accounts shouldn&apos;t mean one idea ten times.</h2>
          <p>Open the sample workspace. See one brief become three different campaigns. No sign-up. The data is already loaded.</p>
          <Link href="/campaigns" className="wl-btn lg light">
            Open the workspace <span aria-hidden="true">›</span>
          </Link>
        </section>
        <footer className="wl-foot">
          <span className="wl-logo" style={{ fontSize: 16 }}>
            <Mark size={20} />
            suki
          </span>
          <span>Suki ghostwrites. You sign.</span>
        </footer>
      </div>
    </div>
  );
}
