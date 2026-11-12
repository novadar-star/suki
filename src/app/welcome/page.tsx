import type { Metadata } from "next";
import { Gabarito, Onest, Sometype_Mono } from "next/font/google";
import Link from "next/link";
import "./welcome.css";

const gabarito = Gabarito({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-gabarito" });
const onest = Onest({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-onest" });
const sometype = Sometype_Mono({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-sometype" });

export const metadata: Metadata = {
  title: "Suki — one brief, every account, your sign-off",
  description: "Suki ghostwrites a playbook and concepts for each account from one brief, checks every line against what the brand may say, and waits for a person to sign.",
};

function Mark({ size }: { size: number }) {
  return (
    <span className="wl-mark" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/suki-mark.webp" alt="" width={size} height={size} />
    </span>
  );
}

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
            <a href="#inside">What&apos;s inside</a>
            <a href="#limits">Limits</a>
          </nav>
          <Link href="/campaigns" className="wl-btn">
            Open workspace
          </Link>
        </div>
      </header>

      <section className="wl-hero">
        <div className="wl-in">
          <span className="wl-pill wl-mono">Ghostwritten by Suki · Signed by you</span>
          <h1>
            One brief<i className="d1">.</i> Every account<i className="d2">.</i> Your sign-off<i className="d3">.</i>
          </h1>
          <p className="wl-sub">Suki drafts a playbook and concepts for each account, checks every line against what the brand may say, and waits for a person to sign.</p>
          <div className="wl-cta">
            <Link href="/campaigns" className="wl-btn lg">
              Open the workspace <span aria-hidden="true">›</span>
            </Link>
            <span className="wl-fine">Demo workspace · sample data · no account needed</span>
          </div>

          <div className="wl-win">
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
                    Script says “<del>instantly plumps your skin</del>”. Approved wording: <ins>helps instantly plump the appearance of dehydrated skin</ins>.
                  </span>
                </div>
                <div className="wl-acts">
                  <span className="wl-chip ink">Apply suggested fix</span>
                  <span className="wl-chip">Request changes</span>
                </div>
                <span className="wl-fine">Drafted by Suki. A person approves every concept.</span>
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
        <div className="wl-in">
          <span className="wl-kick wl-mono">Why teams use it</span>
          <h2>The same product, without the same caption everywhere</h2>
          <div className="wl-vs">
            <div className="no">
              <h3>Without Suki</h3>
              <ul>
                <li>
                  <span className="wl-ic x" aria-hidden="true">×</span>One caption pasted across every account
                </li>
                <li>
                  <span className="wl-ic x" aria-hidden="true">×</span>Claims checked from memory
                </li>
                <li>
                  <span className="wl-ic x" aria-hidden="true">×</span>Approvals scattered across chat threads
                </li>
                <li>
                  <span className="wl-ic x" aria-hidden="true">×</span>Nobody is sure what stage a campaign is in
                </li>
              </ul>
            </div>
            <div className="yes">
              <h3>With Suki</h3>
              <ul>
                <li>
                  <span className="wl-ic v" aria-hidden="true">✓</span>A playbook for each account, in its own voice
                </li>
                <li>
                  <span className="wl-ic v" aria-hidden="true">✓</span>Every line checked against the approved claims
                </li>
                <li>
                  <span className="wl-ic v" aria-hidden="true">✓</span>One review queue, and blocked claims can&apos;t be approved
                </li>
                <li>
                  <span className="wl-ic v" aria-hidden="true">✓</span>Eight stages, with the current one always marked
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="wl-sec" id="how">
        <div className="wl-in">
          <span className="wl-kick wl-mono">How it works</span>
          <h2>From brief to signed-off in three moves</h2>
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
                <p className="wl-muted">Pick the product, the accounts and whether the goal is organic attention or paid conversion.</p>
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
                <h3>Suki drafts for each account</h3>
                <p className="wl-muted">A playbook and three concepts per account, each with a hook, scenes and a call to action.</p>
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
                <p className="wl-muted">Flagged lines show the approved wording beside them. Sign-off opens only when every concept is approved.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="wl-sec" id="inside">
        <div className="wl-in">
          <div className="wl-tags">
            <span>Campaigns</span>
            <span>Brand Brain</span>
            <span>Accounts</span>
            <span>Trend references</span>
            <span>Review</span>
            <span>Results</span>
          </div>
          <h2>Everything a campaign needs, in one workspace</h2>
          <ul className="wl-feat">
            <li>
              <h3>Brand Brain</h3>
              <p className="wl-muted">Product facts, the brand&apos;s own marketing claims, prohibited claims and words to avoid. Creative may use the first two and nothing else.</p>
            </li>
            <li>
              <h3>Accounts</h3>
              <p className="wl-muted">Each account keeps its own audience, voice, formats and past hooks, so two accounts can reach the same people and still sound nothing alike.</p>
            </li>
            <li>
              <h3>Trend references</h3>
              <p className="wl-muted">Formats such as “get ready with me” or “problem and solution”, each showing the dated evidence behind it.</p>
            </li>
            <li>
              <h3>Results and the next round</h3>
              <p className="wl-muted">Log what happened after posting. The learnings are carried into the next round&apos;s playbooks.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="wl-sec" id="limits">
        <div className="wl-in">
          <span className="wl-kick wl-mono">What Suki will not do</span>
          <h2>It says so when it does not know</h2>
          <div className="wl-not">
            <div>
              <h3>It cannot watch videos</h3>
              <p className="wl-muted">The AI reads only your description of a reference. It cannot see the video or its numbers.</p>
            </div>
            <div>
              <h3>It has no live trend data</h3>
              <p className="wl-muted">A format counts as observed only when someone logs dated evidence for it.</p>
            </div>
            <div>
              <h3>It never strengthens a claim</h3>
              <p className="wl-muted">Creative may use the brand&apos;s wording. A stronger version is flagged before a person sees it.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="wl-in">
        <section className="wl-end">
          <Mark size={64} />
          <h2>
            Suki <em>ghostwrites.</em> You sign.
          </h2>
          <Link href="/campaigns" className="wl-btn lg light">
            Open the workspace <span aria-hidden="true">›</span>
          </Link>
        </section>
        <footer className="wl-foot">
          <span className="wl-logo" style={{ fontSize: 16 }}>
            <Mark size={20} />
            suki
          </span>
          <span>Creative operations studio. The examples on this page are sample data.</span>
        </footer>
      </div>
    </div>
  );
}
