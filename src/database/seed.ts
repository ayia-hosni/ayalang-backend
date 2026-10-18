import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { Category } from '../categories/category.entity';
import { Question } from '../questions/question.entity';
import { SubQuestion } from '../questions/sub-question.entity';

const SEED_DATA: {
  category: Omit<Category, 'id' | 'questions'>;
  questions: {
    text: string;
    subQuestions: string[];
    hints: string[];
    exampleAnswers: string[];
    track?: string;
    stack?: string;
    difficulty?: string;
  }[];
}[] = [
  {
    category: {
      title: 'Behavioral',
      subtitle: 'Common Scenarios',
      color: 'bg-pink-400',
      icon: '🧠',
    },
    questions: [
      {
        text: 'Tell me about a time you led a team through a conflict.',
        difficulty: 'Mid',
        subQuestions: [
          'What was the conflict, specifically?',
          'What was your role in resolving it?',
          'What was the outcome, and what would you do differently?',
        ],
        hints: [
          'Use the STAR method: Situation, Task, Action, Result.',
          'Focus on your actions, not just what the team did.',
          'End with a concrete, measurable outcome.',
        ],
        exampleAnswers: [
          'Two engineers on my team did not agree. One wanted to rewrite a broken part of the code. The other wanted to fix it fast because of the deadline. I set up a short call. Each person explained their reason. Then I gave a plan: fix it now, and plan the rewrite for next sprint. Both agreed, because they felt heard. We finished on time. Next time, I will talk about this kind of problem earlier, before it becomes personal.',
          'During a launch, a designer and a backend engineer had a disagreement. They did not agree on the shape of the API data. This was slowing down our work. I brought them together in one room. Each person explained their needs. I saw that they were solving different problems. I wrote a short document with both needs together. We agreed on one new format. We were only two days late. Now I ask teams to write this kind of document before a conflict starts.',
        ],
      },
      {
        text: 'Describe a time you failed and what you learned from it.',
        difficulty: 'Junior',
        subQuestions: [
          'What was the situation and what went wrong?',
          'What did you learn from it?',
          'How have you applied that lesson since?',
        ],
        hints: [
          "Pick a real failure — avoid disguised humble-brags like 'I worked too hard'.",
          'Own the mistake before explaining the lesson.',
          'Show growth: connect the lesson to a later, better outcome.',
        ],
        exampleAnswers: [
          'I once ran a database script without testing it on a big, real-size copy of the data first. It locked an important table for eleven minutes during work hours. I saw my mistake right away. I fixed it fast and wrote a report the same day. I learned that testing on a small copy is not enough. The real data is much bigger, so it behaves differently. Now I always test on a big copy before I run a script like this. This habit has already stopped two similar problems.',
          'Early in a project, I gave a time estimate of one week for a new feature. I did not break the work into small steps first. In the end, it took three weeks. I did not know that a third-party tool had hidden limits on how often we could call it. This taught me an important lesson. Now, before I give any estimate, I spend one day testing any new tool or system I do not know well. Since then, my estimates are much closer to the real time.',
        ],
      },
      {
        text: 'Tell me about a time you had to persuade a skeptical stakeholder to adopt your approach.',
        difficulty: 'Mid',
        subQuestions: [
          'Who was skeptical, and what were they worried about?',
          'How did you make your case?',
          'Did they come around, and how do you know?',
        ],
        hints: [
          'Name their actual objection instead of a strawman — it shows you understood their position.',
          'Lead with data or a small proof-of-concept rather than just asserting you were right.',
          "Be honest if you only won them over partially, that's more credible than a clean win.",
        ],
        exampleAnswers: [
          'A product manager did not want us to spend a full sprint on tests. She was worried it would slow down new features. I did not just argue with opinions. I showed her data from our last three production problems. I calculated the hours we lost fixing bugs versus the hours tests would cost. I also wrote a small set of tests for our most unstable part of the code first. She could see the result before saying yes to more. She agreed to the full sprint. After that, our number of bugs dropped by half.',
        ],
      },
      {
        text: 'Describe a time you disagreed with a decision your manager made.',
        difficulty: 'Mid',
        subQuestions: [
          'What was the decision, and why did you disagree?',
          'How did you raise your concern?',
          'What happened after — did you comply, escalate, or find a middle ground?',
        ],
        hints: [
          'Show you raised it professionally and privately, not by undermining them publicly.',
          "Acknowledge their constraints; you probably didn't have the full picture either.",
          'End with how you moved forward, even if the decision stayed the same.',
        ],
        exampleAnswers: [
          'My manager wanted to cut our testing time to just one day before a big release. I disagreed. I knew our normal tests alone took longer than one day. I raised this concern with her in private. I showed her the real numbers and the real timeline. She had not seen it laid out this way before. She agreed to move the release two days later instead of cutting testing. Even if she had kept her first decision, I would have written down the risk and then done my best with the plan.',
        ],
      },
      {
        text: 'Tell me about a time you had to learn an unfamiliar technology quickly to finish a project.',
        difficulty: 'Junior',
        subQuestions: [
          'What was the technology, and why did you need it fast?',
          'How did you approach learning it under time pressure?',
          'How did it turn out?',
        ],
        hints: [
          "Name the specific gap, not just 'a new framework' — specificity is credible.",
          'Describe a concrete learning strategy: docs, a spike, pairing with someone who knew it.',
          'Tie the learning back to a real, shipped outcome.',
        ],
        exampleAnswers: [
          'I was asked to add live, real-time updates to a feature. I had only used this kind of tool in a small tutorial before. On the first day, I built a small test project, outside our main code. I wanted to understand how the connection worked and what happens if it breaks. Then I sat with a teammate for one hour. She had used this tool before in another job. Because of this early work, the real feature only took three days, not the one week I planned. I also wrote a short guide, so the next person will learn faster than I did.',
        ],
      },
      {
        text: 'Describe a time you had to juggle multiple deadlines that all mattered.',
        difficulty: 'Junior',
        subQuestions: [
          'What were the competing priorities?',
          'How did you decide what to work on first?',
          'What was the outcome, and what would you change about how you prioritized?',
        ],
        hints: [
          'Explain your prioritization criteria explicitly (impact, dependency, reversibility) rather than just "I worked harder".',
          'Mention who you communicated with about tradeoffs — prioritization is rarely a solo decision.',
          "It's fine if something slipped, as long as it was the right thing to slip and you flagged it early.",
        ],
        exampleAnswers: [
          'I had two important tasks due in the same week. One was a bug fix for a customer. The other was an internal project. I chose to fix the bug first. It was blocking a paying customer, and it was easier to reverse if something went wrong. I told the team early that the internal project would be two days late. Because I did not switch between tasks all the time, I finished the bug fix one day early. This gave me extra time for the second task too. Next time, I will raise this kind of conflict as soon as I see it, not a few days later.',
        ],
      },
    ],
  },
  {
    category: {
      title: 'Technical',
      subtitle: 'Frontend, Backend, DevOps & Mobile',
      color: 'bg-yellow-400',
      icon: '💻',
    },
    questions: [
      {
        text: 'How would you design a URL shortening service?',
        difficulty: 'Mid',
        track: 'Backend',
        subQuestions: [
          'What are the functional and non-functional requirements?',
          'How do you generate and store short codes?',
          'How does the system scale for reads vs. writes?',
        ],
        hints: [
          'Clarify requirements first: scale, custom aliases, expiry.',
          'Talk about the encoding scheme (base62) and collision handling.',
          'Mention caching and read/write ratio to justify your data store choice.',
        ],
        exampleAnswers: [
          'First, I would ask some questions. How many users? Do we need custom short links? Do links expire? For the short code, I would turn a number into short text using base62. Or I could use a hash of the link, and try again if there is a clash. I would save the link and its code in a fast key-value database, like DynamoDB. Most people will click links much more than they create them. So I would add a cache, like Redis, in front of the database. This makes reading very fast. When one database gets too busy, I would split the data by the first letters of the short code.',
          'The main job is simple: turn a long link into a short one, and send users to the right place when they click it. It also needs to work fast, even with many, many clicks. I would create short codes with a simple counter, turned into base62 text. This way, codes never clash with each other. I would store the data in a fast key-value database. Since most traffic is reading, not writing, I would cache popular links close to the user, using a CDN. I would only check the database when the cache does not have the answer. A custom link is just an extra check: is this name already used?',
        ],
      },
      {
        text: 'Explain how you would debug a memory leak in a production service.',
        difficulty: 'Senior',
        track: 'Backend',
        subQuestions: [
          'How do you confirm it is actually a leak?',
          'What tools would you use to find the source?',
          'How do you validate the fix in production?',
        ],
        hints: [
          'Start with monitoring/metrics before diving into a heap dump.',
          'Name concrete tools (heap snapshots, profilers) relevant to your stack.',
          'Mention a safe rollout: canary, gradual traffic, and rollback plan.',
        ],
        exampleAnswers: [
          'First, I would look at memory graphs over time. I want to see if memory keeps growing, or if it just goes up and down normally. If it keeps growing, that is a real leak. Next, I would take two memory snapshots while the app is under load. I would compare them to see which type of object keeps growing. Often, the cause is an old listener or a cache that never clears old data. After I fix it, I would release the fix to a small group of users first. I would watch the memory graph get flat again before sending it to everyone. I would also keep an easy way to undo the change, in case something looks wrong.',
          'I would start by checking our normal monitoring tools. A real leak looks different from normal behavior. In a healthy app, memory goes up and down. In a leak, memory keeps rising and never comes back down. Then I would use a profiler, or take memory snapshots, on a test server under similar load. This helps me find which part of the code keeps holding on to memory. Often, the problem is a cache with no limit. After I fix it, I would release the change slowly and watch the memory graph for a few hours before it goes to all users.',
        ],
      },
      {
        text: 'How would you design a rate limiter for a public API?',
        difficulty: 'Mid',
        track: 'Backend',
        subQuestions: [
          'What algorithm would you use, and why?',
          'Where does the rate limit state live in a multi-instance deployment?',
          'What do you return to a client that gets rate limited?',
        ],
        hints: [
          "Name a concrete algorithm — token bucket or sliding window log — over vague 'limit requests per user'.",
          'A shared store like Redis is required once you have more than one API instance, since in-memory counters would be per-instance.',
          'A 429 status with a Retry-After header is the expected, well-behaved contract.',
        ],
        exampleAnswers: [
          'I would use a method called token bucket. It lets users make quick bursts of requests, but keeps the average rate steady over time. This matches how real users behave better than a strict, fixed limit. I would key this by user ID or API key. If we run more than one server, this counter cannot live only in memory on one machine. It needs to live in a shared place, like Redis. If it stays only in memory, each server would have its own separate limit, and the real limit would be much higher than planned. When a user goes over the limit, I would send back a 429 error, with a Retry-After message. This tells good clients exactly when to try again.',
        ],
      },
      {
        text: "Walk me through how you'd diagnose a slow SQL query in production.",
        difficulty: 'Mid',
        track: 'Backend',
        subQuestions: [
          'How do you find which query is actually slow?',
          'How do you figure out why it is slow?',
          'What are your options for fixing it without taking the database down?',
        ],
        hints: [
          'Start from slow query logs or APM traces, not guessing — you need the actual query and its frequency.',
          'EXPLAIN ANALYZE tells you whether it is a missing index, a bad join order, or just returning too many rows.',
          'Adding an index concurrently (e.g. CREATE INDEX CONCURRENTLY in Postgres) avoids locking the table during the fix.',
        ],
        exampleAnswers: [
          'First, I would find the real slow query. I would check slow-query logs or a monitoring tool, not just guess. It feels slow is not the same as it is actually slow and happens often. Then I would run EXPLAIN ANALYZE on the query. This shows the real query plan. Usually, the problem is a missing index, or a join that creates too many rows before filtering. If it is a missing index, I would add it using CREATE INDEX CONCURRENTLY. This way, I do not lock the table during work hours. Then I would run the query again to check that it is really faster now.',
        ],
      },
      {
        text: 'When would you choose a NoSQL database over a relational one for a new service?',
        difficulty: 'Junior',
        track: 'Backend',
        subQuestions: [
          'What access patterns push you toward NoSQL?',
          'What do you give up by moving away from a relational model?',
          'Can you give a concrete example of a feature that fits each?',
        ],
        hints: [
          'Talk about access pattern first — NoSQL choices are usually driven by a known, fixed query shape at scale.',
          'Naming what you lose (joins, ad-hoc queries, strong consistency in some systems) shows you understand the tradeoff, not just the trend.',
          'A concrete example (e.g. a session store vs. a financial ledger) is more convincing than an abstract answer.',
        ],
        exampleAnswers: [
          "I would choose NoSQL when I have one clear, simple, and very common way of reading data. For example, getting a user's session by their ID. A key-value store gives a very fast answer for this, without the extra weight of a full relational database. But NoSQL usually means giving up flexible search and table joins. So it is a bad fit for something like a bank ledger, where you need strong consistency and complex reports. For this app, something like session data, or a saved leaderboard, could work well in NoSQL. But the main question and user data should stay in a normal database like Postgres, because they are closely connected.",
        ],
      },
      {
        text: 'How would you design a notification system that supports email, SMS, and push?',
        difficulty: 'Senior',
        track: 'Backend',
        subQuestions: [
          'How do you keep the system open to adding new channels later?',
          'How do you handle a channel provider being down or slow?',
          'How would you avoid sending duplicate notifications for the same event?',
        ],
        hints: [
          'An abstraction like a NotificationSender interface per channel, dispatched from a queue, keeps channels swappable and independently scalable.',
          'Retries with backoff plus a dead-letter queue stop one flaky provider from blocking the whole system.',
          'An idempotency key per (event, channel) pair, checked before send, is the standard way to prevent duplicates.',
        ],
        exampleAnswers: [
          'I would put a queue in front of the system. This way, creating a notification event is separate from actually sending it. I would have one worker for each channel: email, SMS, and push. Each worker would follow the same simple interface. This makes it easy to add a new channel later, without changing old code. If sending fails, each worker would try again with growing wait times. After too many failed tries, the message goes to a special dead-letter queue, instead of blocking everything else. To stop duplicate messages, I would create one unique key for each event and channel. Before sending, I would check if this key was already used.',
        ],
      },
      {
        text: 'In Laravel, how would you prevent an N+1 query problem when listing orders along with their line items?',
        difficulty: 'Junior',
        track: 'Backend',
        stack: 'Laravel',
        subQuestions: [
          'How would you first notice the N+1 was happening?',
          'What Eloquent feature fixes it?',
          'How would you catch this in code review before it reaches production?',
        ],
        hints: [
          'Laravel Debugbar or the query log will show one query per order instead of a single joined query — that pattern is the tell.',
          "Eager loading with `Order::with('lineItems')->get()` replaces N+1 queries with a single extra query using a WHERE IN.",
          'A team convention of running Debugbar locally, or a query-count assertion in feature tests, catches this before code review even starts.',
        ],
        exampleAnswers: [
          "I would first notice this in Laravel Debugbar or the query log. I would see one query for every single order, instead of one combined query. This pattern, where the number of queries grows with the number of rows, is the classic sign of an N+1 problem. The fix is called eager loading. Instead of writing $order->lineItems inside a loop, which runs a new query every time, I would write Order::with('lineItems')->get(). This tells Eloquent to load all line items in just one extra query. To catch this early, I would make it a habit to check Debugbar during development. For important pages, I would also add a test that checks the number of queries stays the same, even when the data grows.",
        ],
      },
      {
        text: "How does Laravel's queue system help you keep a slow operation, like sending an email, out of the request cycle?",
        difficulty: 'Mid',
        track: 'Backend',
        stack: 'Laravel',
        subQuestions: [
          'How do you turn a synchronous action into a queued job?',
          'What happens if the job fails?',
          'How would you test that a job was dispatched without actually sending the email?',
        ],
        hints: [
          'Implementing ShouldQueue on a Mailable or Job means dispatch() pushes it onto a queue instead of running inline.',
          'Failed jobs land in the failed_jobs table after exhausting configured retries/backoff, and can be inspected and retried.',
          'Mail::fake() or Queue::fake() lets you assert a job/mail was dispatched with the right data, without a real queue worker or SMTP call in the test.',
        ],
        exampleAnswers: [
          'If I add ShouldQueue to the Mailable class, then Mail::to($user)->send(...) does not run right away inside the request. Instead, it saves the job and puts it on a queue. This means the user gets a fast response, while a separate worker sends the email later. If the job fails, Laravel tries again, following the retry settings. After too many failed tries, the job moves to the failed_jobs table. I can look at the error there and try again by hand. To test this without sending a real email, I would use Mail::fake(). This lets me check that the right email was queued, with the right data, without a real mail server.',
        ],
      },
      {
        text: 'In a Spring Boot service, how would you make sure two related database updates either both succeed or both fail?',
        difficulty: 'Mid',
        track: 'Backend',
        stack: 'Spring',
        subQuestions: [
          'What annotation manages this, and what does it actually do?',
          'What is a common mistake that silently breaks the transaction boundary?',
          'How would you handle a case where one of the two updates is a call to an external service?',
        ],
        hints: [
          '@Transactional on the service method wraps both repository calls in a single database transaction, rolling back both on an unchecked exception.',
          "A classic mistake is calling the @Transactional method from another method in the same class — Spring's proxy-based AOP means that self-invocation bypasses the transaction entirely.",
          'An external call cannot be rolled back by a DB transaction, so that usually calls for an outbox pattern or a compensating action instead of relying on @Transactional alone.',
        ],
        exampleAnswers: [
          "I would add @Transactional to the service method. This wraps both database updates inside one single transaction. If either one throws an error, Spring rolls back both changes together. One common mistake is calling this method from another method inside the same class. Spring's design for @Transactional depends on a proxy, so calling it this way skips the transaction completely, often without any warning. If one of the two steps is a call to an outside service, instead of a second database write, @Transactional cannot help there. In that case, I would use an outbox pattern. I save the plan to the database as part of the transaction, then a separate process sends it later. This way, a failure in the middle does not leave things half-done.",
        ],
      },
      {
        text: 'Explain the difference between constructor injection and field injection in Spring, and why one is generally preferred.',
        difficulty: 'Junior',
        track: 'Backend',
        stack: 'Spring',
        subQuestions: [
          'What does each style look like in code?',
          'Why does constructor injection make testing easier?',
          'What does constructor injection give you for free around immutability and required dependencies?',
        ],
        hints: [
          'Field injection uses @Autowired directly on a field; constructor injection passes dependencies through the constructor, which Spring populates automatically.',
          'Constructor injection lets you instantiate the class with plain `new` and mocks in a unit test, without needing a Spring context or reflection-based field injection.',
          'Constructor parameters can be marked final, making required dependencies explicit and the object immutable after construction — field injection allows a half-constructed object with null dependencies to exist.',
        ],
        exampleAnswers: [
          'Field injection puts @Autowired directly on a class field. Spring fills it in later, using reflection, after the object is created. Constructor injection is different. It passes every needed value in through the constructor. Spring calls this constructor automatically when it builds the object. Constructor injection makes testing much easier. I can create the class myself with new, and pass in test objects directly. I do not need Spring or reflection at all for a simple test. It also lets me mark the fields as final. This makes it clear which values are required, and it stops the object from ever existing in a broken, half-built state. Field injection cannot promise this.',
        ],
      },
      {
        text: 'How would you optimize the initial load performance of a large single-page application?',
        difficulty: 'Mid',
        track: 'Frontend',
        subQuestions: [
          'How do you find out what is actually slow before optimizing anything?',
          'What are the main levers for cutting initial bundle size?',
          'What would you measure after shipping the fix to confirm it worked?',
        ],
        hints: [
          'Start with a Lighthouse/WebPageTest trace or real-user monitoring — guessing at the bottleneck wastes effort on the wrong fix.',
          'Route-level code splitting and lazy-loading anything below the fold are the biggest, lowest-risk wins before micro-optimizing individual components.',
          'Track Largest Contentful Paint and Time to Interactive in real-user monitoring after the change, not just bundle size in isolation.',
        ],
        exampleAnswers: [
          'First, I would use a tool like Lighthouse, or real data from real users, to find the actual slow part. I would not just guess. The problem could be our own code, or it could be a slow script from another company. If the bundle size is the real problem, I would split the code by page or route, so users only load what they need. I would also delay loading anything below the visible part of the screen at first. These two changes usually give the biggest results. After shipping the fix, I would watch two numbers in real user data: how fast the main content appears, and how fast the page becomes usable. A smaller file size on paper does not always mean a faster page for real users.',
        ],
      },
      {
        text: 'Explain the tradeoffs between client-side rendering, server-side rendering, and static generation.',
        difficulty: 'Mid',
        track: 'Frontend',
        subQuestions: [
          'What does each approach actually do differently at request time?',
          'What kind of page or product is each one best suited for?',
          'What does SSR cost you that a pure client-side app does not have to worry about?',
        ],
        hints: [
          'CSR ships a near-empty HTML shell and renders everything in the browser; SSR renders full HTML per request on the server; SSG renders HTML once at build time and serves it as a static file.',
          'SSR/SSG both help first-paint speed and SEO; CSR is simplest to build and host but is slower to first meaningful paint, especially on slow devices.',
          'SSR needs a running server per request (more infra, more cost) and forces you to think about code that only runs in a browser (e.g. window/localStorage) failing on the server.',
        ],
        exampleAnswers: [
          "With client-side rendering, the server sends an almost empty page. The browser then downloads the code and builds the whole page itself. This is simple to build, but it can feel slow, especially on older phones. With server-side rendering, the server builds the full page for every request. This makes the first view fast, and it is good for search engines. But it also means we need a real server doing work for every visit, which costs more. With static generation, the page is built one time, when we publish the app. After that, it is served like a simple file, which is very fast and cheap. This only works for pages that do not change often. For this app, the practice questions could use static generation. But a user's own list of recordings could not, because it changes for each person.",
        ],
      },
      {
        text: 'How do you manage state in a large frontend application without prop-drilling everywhere?',
        difficulty: 'Junior',
        track: 'Frontend',
        subQuestions: [
          'What is prop-drilling, concretely, and why does it get painful at scale?',
          'What are your options for sharing state without it?',
          'How do you decide what belongs in shared state versus local component state?',
        ],
        hints: [
          "Prop-drilling is passing a value through several intermediate components that don't use it themselves, just to get it to a deeply nested child — it gets painful because every intermediate component now depends on props it doesn't care about.",
          'Options include a shared service/store injected where needed (DI), context/provider patterns, or a dedicated state library — the right one depends on how global and how often-changing the state is.',
          'A useful rule: if only a component and its direct children need a value, keep it local; if unrelated branches of the tree need to react to the same value, it belongs in shared state.',
        ],
        exampleAnswers: [
          'Prop-drilling means passing a value through many components that do not use it, just to reach one small component deep inside. This becomes painful because every component in between now depends on data it does not care about. Instead, I would use a shared service or store. Any component can read from it directly, no matter where it sits in the page. This removes the need to pass data through every level. I only move something into shared state when two separate parts of the app need to use the same value. If only one component and its direct children need a value, I keep it local. This keeps changes small and simple.',
        ],
      },
      {
        text: "In React, how would you stop a component from re-rendering every time its parent updates, when its own props haven't actually changed?",
        difficulty: 'Mid',
        track: 'Frontend',
        stack: 'React',
        subQuestions: [
          'What does React.memo actually do to a component?',
          "Why can memo fail to help even when you've applied it?",
          'When is this optimization not worth doing?',
        ],
        hints: [
          'React.memo shallow-compares the new props to the previous props and skips re-rendering if none changed.',
          'If a prop is a new function or object literal created on every parent render, the shallow comparison sees a "different" reference every time — memo does nothing until that prop is made referentially stable with useCallback/useMemo.',
          "It's not worth it on cheap components — the memo comparison itself has a cost, and for a component that renders trivially fast, you can spend more time comparing props than you save.",
        ],
        exampleAnswers: [
          'When I wrap a component in React.memo, React compares the new props to the old props. If none of them changed, it skips the re-render. But there is a common trap. If the parent passes a new function or object every time it renders, React sees this as a different value, even if the data looks the same. To fix this, I would wrap the function in useCallback, or the object in useMemo, so the value stays stable between renders. I do not add memo to every component, though. For a simple, cheap component, comparing props can cost more time than just re-rendering it. I only add memo after I see, through real testing, that one component is re-rendering too much and it is actually slow.',
        ],
      },
      {
        text: 'Explain the difference between useEffect and useLayoutEffect in React, and when you would reach for useLayoutEffect.',
        difficulty: 'Mid',
        track: 'Frontend',
        stack: 'React',
        subQuestions: [
          'When does each one actually run relative to the browser painting?',
          'What visual problem does useLayoutEffect solve that useEffect does not?',
          'Why is useLayoutEffect not the safe default choice?',
        ],
        hints: [
          'useEffect runs asynchronously after the browser has painted the updated DOM; useLayoutEffect runs synchronously after DOM mutations but before the browser paints.',
          'If you need to measure a DOM node and then synchronously adjust something (like positioning a tooltip) before the user sees it, useEffect can cause a visible flicker because the browser already painted the "wrong" position first.',
          'useLayoutEffect blocks painting until it finishes, so using it by default can hurt perceived performance — it should be reserved for the specific case of synchronous DOM measurement/mutation.',
        ],
        exampleAnswers: [
          'useEffect runs after the browser has already painted the new screen. useLayoutEffect runs earlier. It runs right after the DOM changes, but before the browser paints anything to the screen. I would use useLayoutEffect when I need to measure something on the screen, like the size of an element, and then change the layout right away, before the user sees it. With useEffect, the browser might paint the wrong position first, and the user would see a quick flash before it fixes itself. I do not use useLayoutEffect everywhere, though. It blocks the screen from updating until it finishes. So I only use it for this one case: measuring, then changing the layout right away.',
        ],
      },
      {
        text: "Explain the difference between Angular's OnPush change detection strategy and the default strategy, and when you'd reach for OnPush.",
        difficulty: 'Mid',
        track: 'Frontend',
        stack: 'Angular',
        subQuestions: [
          'What does the default change detection strategy check, and how often?',
          'What specifically triggers a check under OnPush?',
          'What kind of component benefits most from switching to OnPush?',
        ],
        hints: [
          'The default strategy walks the entire component tree top-down and checks every component on every change detection cycle, regardless of whether its inputs actually changed.',
          'Under OnPush, a component is only re-checked when one of its @Input references changes, a DOM event originates inside it, or a signal it reads is updated — not just because a CD cycle ran.',
          "A component with many children and inputs that are passed as new object/array references only when they truly change (or are signals) benefits most, since OnPush skips whole subtrees that haven't changed.",
        ],
        exampleAnswers: [
          'The default change detection strategy checks every single component, every time, in the whole tree. It does this on every check cycle, even if nothing about that component changed. This is simple, but it can get slow in a big app. OnPush works differently. A component is only checked again when one of its @Input values changes, when an event happens inside it, or when a signal it reads gets updated. I would use OnPush on components deep inside a long list, where the input values only change when there is a real, new change. This lets Angular skip whole parts of the page that have not changed, instead of checking every single one.',
        ],
      },
      {
        text: "How does Angular's dependency injection differ between providing a service with providedIn: 'root' versus providing it at the component level?",
        difficulty: 'Junior',
        track: 'Frontend',
        stack: 'Angular',
        subQuestions: [
          "What does providedIn: 'root' actually give you?",
          "What changes if you list the same service in a component's `providers` array instead?",
          'When would you deliberately choose the component-level option?',
        ],
        hints: [
          "providedIn: 'root' creates a single app-wide singleton instance, and it's tree-shakable — if nothing ever injects it, it's not included in the bundle at all.",
          "Providing it in a component's `providers` array creates a new instance scoped to that component (and shared by its children), separate from the root singleton.",
          'Component-level providers are the right call when each instance of a component needs its own isolated state in that service, like a wizard or form component that should not share state with a sibling instance of itself.',
        ],
        exampleAnswers: [
          "When I use providedIn: root, Angular creates just one instance of the service, and the whole app shares it. If nothing ever uses this service, Angular's build process removes it from the final file completely. If I list the service inside a component's own providers array instead, Angular creates a new, separate instance just for that component and its children. This is different from the one shared, app-wide instance. I would choose the component-level option when I have more than one copy of the same component on a page, and each copy needs its own separate data. For example, two form wizards on the same page. If they shared one instance, one wizard's data could leak into the other.",
        ],
      },
      {
        text: "Explain the difference between computed properties and watchers in Vue, and when you'd choose one over the other.",
        difficulty: 'Junior',
        track: 'Frontend',
        stack: 'Vue',
        subQuestions: [
          'What does a computed property give you that a plain method call does not?',
          'What is a watcher for, that a computed property cannot do?',
          'Can you give an example of picking the wrong one and why it would be awkward?',
        ],
        hints: [
          'A computed property is cached and declarative — it recomputes only when one of its reactive dependencies changes, and always returns a value to use in the template.',
          "A watcher is for running a side effect in response to a change — like making an API call or mutating something outside Vue's reactive state — and doesn't return a value.",
          'Using a watcher to derive a display value is awkward because you end up manually assigning to another reactive variable, duplicating what a computed property would give you for free with caching built in.',
        ],
        exampleAnswers: [
          "A computed property is saved and reused. It only runs again when one of the values it depends on actually changes. It always gives back a value that I can use directly in the page, like a full name made from a first name and last name. A watcher is different. It runs a side action when something changes, like calling an API, or changing something outside Vue's normal data system. A watcher does not give back a value. If I used a watcher just to build a display value, I would need to manually save it into another variable myself. This repeats work that a computed property already does for me, with saving and tracking built in.",
        ],
      },
      {
        text: "How does Vue 3's Proxy-based reactivity system detect changes to an object, and what's a common gotcha when destructuring a reactive object?",
        difficulty: 'Mid',
        track: 'Frontend',
        stack: 'Vue',
        subQuestions: [
          'What does wrapping an object in a Proxy actually let Vue do?',
          'What could Vue 2 not detect that Vue 3 can?',
          'What happens if you destructure a reactive object into plain variables, and how do you avoid it?',
        ],
        hints: [
          'Vue 3 wraps a reactive object in a JavaScript Proxy, so every property get/set goes through a trap that lets Vue automatically track dependencies on read and trigger updates on write.',
          "Vue 2's Object.defineProperty-based reactivity couldn't detect new properties added after creation, or array index/length changes, without special-cased workarounds — the Proxy approach handles both natively.",
          'Destructuring a reactive object into plain variables copies out the current primitive values at that moment, losing the connection to the reactive object entirely — toRefs() preserves reactivity by converting each property into its own ref instead.',
        ],
        exampleAnswers: [
          "Vue 3 wraps a reactive object inside something called a Proxy. Every time code reads or writes a value, it passes through this Proxy. This lets Vue track exactly which parts of the page depend on which piece of data, and update only what is needed. This is actually better than Vue 2. Vue 2 used a different method that could not detect a brand-new property added to an object later, or a change to an array's length, without special extra code. Vue 3 handles both of these cases naturally. One common mistake is pulling values out of a reactive object using destructuring. This copies out the plain value at that moment, and it loses the connection to the reactive object. The fix is to use toRefs() first, which keeps each value connected and reactive.",
        ],
      },
      {
        text: 'How would you design a CI/CD pipeline for a service that includes a database migration step?',
        difficulty: 'Mid',
        track: 'DevOps',
        subQuestions: [
          'What stages would the pipeline have, in order?',
          'Where does the migration actually run, and why not just run it inside the app on boot?',
          'What is your rollback plan if a migration succeeds but the new app code has a bug?',
        ],
        hints: [
          'A typical order is: lint/typecheck → unit tests → build → run migrations against the target DB → deploy the new app version → smoke test.',
          'Running migrations as a distinct pipeline step (not on app boot) avoids multiple app instances racing to apply the same migration concurrently.',
          'Favor backward-compatible, additive migrations so you can roll back the app version without also having to roll back the schema — a schema rollback under real traffic is much riskier.',
        ],
        exampleAnswers: [
          'I would order the pipeline like this: check code style and types, run unit tests, build the app, run database migrations, deploy the new app, then run a quick check on the live site. I would run migrations as their own separate step, not automatically when the app starts. If migrations ran on app start, and we have more than one server starting at the same time, they could both try to run the same migration at once. That is a race condition I want to avoid. For rollback, I try to write migrations that only add things, and stay compatible with the old code. This way, if the new app code has a bug, I can roll back just the app, without also needing to undo the database change.',
        ],
      },
      {
        text: "Explain blue-green versus canary deployments, and when you'd choose one over the other.",
        difficulty: 'Senior',
        track: 'DevOps',
        subQuestions: [
          'How does each strategy actually route traffic?',
          'What kind of bug does each strategy catch well, and what does each miss?',
          'What would push you to pick canary over a simpler blue-green setup?',
        ],
        hints: [
          'Blue-green keeps two full environments and switches all traffic at once via a router/load balancer flip; canary gradually shifts a small percentage of traffic to the new version and increases it over time.',
          'Blue-green gives instant, all-or-nothing rollback but does not catch bugs that only appear under partial real traffic or specific user segments.',
          'Canary catches issues earlier with limited blast radius but needs good metrics/alerting to know when to stop the rollout, and takes longer to fully release.',
        ],
        exampleAnswers: [
          'Blue-green deployment keeps two full, identical setups running. When we are ready, we switch all traffic from the old one to the new one at once, using the load balancer. This gives a fast, clean way to go back if something goes wrong. Canary deployment is different. It sends only a small part of real traffic to the new version first, like 5%, then slowly more. This limits the damage if something is broken, since only a few users see it. I would choose canary over blue-green when a change feels risky, or hard to fully test before release. It catches problems early, with less damage, but it needs good monitoring to know when to stop, and it takes longer to reach all users.',
        ],
      },
      {
        text: "What does infrastructure as code give you that manually configuring resources in a cloud console doesn't?",
        difficulty: 'Junior',
        track: 'DevOps',
        subQuestions: [
          'What specifically breaks down as a team and infrastructure grow with console-only changes?',
          'How does IaC change how you review and roll back an infrastructure change?',
          'What is a real risk or downside of IaC you would want a new team to know about?',
        ],
        hints: [
          'Console changes are undocumented and easy to drift between environments — nobody can tell you exactly why a setting is what it is six months later.',
          'IaC turns infrastructure changes into a diff you can review in a pull request and revert with git, the same discipline you already apply to application code.',
          'A real downside: state files can drift from real infrastructure if someone still makes manual changes, and a bad apply can affect many resources at once — IaC needs its own review discipline, not less.',
        ],
        exampleAnswers: [
          'Setting up cloud resources by hand, by clicking in a console, can work fine for one person on one small project. But it does not grow well. Nobody can explain, six months later, why one setting exists. It also becomes easy for different environments to slowly become different from each other. With infrastructure as code, every change is written down and reviewed, just like a change to normal application code. If something goes wrong, we can undo it with a simple command. One real risk to know about: if someone still makes manual changes in the console, the saved code and the real setup can drift apart. Also, one small change in code can affect many resources at once. So this code needs careful review too, not less.',
        ],
      },
      {
        text: 'When would you choose a cross-platform framework like React Native or Flutter over building separate native iOS and Android apps?',
        difficulty: 'Mid',
        track: 'Mobile',
        subQuestions: [
          'What do you gain by going cross-platform?',
          'What do you typically give up, and for which kinds of apps does that matter most?',
          'How would you handle a feature that genuinely needs a native-only API?',
        ],
        hints: [
          'One shared codebase for business logic and most UI cuts development and maintenance cost significantly, especially for a small team.',
          'You typically give up some performance ceiling and immediate access to brand-new platform APIs — this matters most for apps that are animation- or hardware-heavy, like AR or games.',
          'Most cross-platform frameworks support native modules/bridges, letting you drop into native Swift/Kotlin code for the one feature that needs it without abandoning the shared codebase for everything else.',
        ],
        exampleAnswers: [
          'I would choose a cross-platform tool when the team is small, and the app is mostly simple screens: forms, lists, and normal navigation. One shared set of code for the logic and most of the design cuts both build time and long-term cost by a lot, compared to building two separate native apps. What we lose is some raw speed, and same-day access to brand-new features from Apple or Google. This matters a lot for something like a game, or an app using a lot of animation or hardware. It matters much less for a simple, everyday business app. If one feature really needs a native-only tool, most cross-platform frameworks let me write just that one small part in native code, like Swift or Kotlin, and keep everything else shared.',
        ],
      },
      {
        text: 'How would you design offline-first support for a mobile app that needs to sync data once connectivity returns?',
        difficulty: 'Senior',
        track: 'Mobile',
        subQuestions: [
          'Where does data live while the device is offline?',
          'How do you queue and later replay the actions the user took offline?',
          'How do you resolve a conflict if the same record changed both on the device and on the server?',
        ],
        hints: [
          'A local database (SQLite, Realm, or similar) is the source of truth while offline, with the UI always reading from it rather than waiting on the network.',
          'Mutations get written to a local outbox/queue with a timestamp and unique ID, replayed against the server in order once connectivity returns.',
          'A conflict resolution strategy has to be chosen deliberately — last-write-wins by timestamp is simplest, but merging fields or asking the user is sometimes required for anything non-trivial.',
        ],
        exampleAnswers: [
          'I would use a local database, like SQLite, as the main source of truth on the device at all times. The app reads and writes to this local database first, so it always feels fast, even with no internet. Every action the user takes while offline gets saved into a local list, with a time and a unique ID. Once the internet comes back, a sync process sends these saved actions to the server, one by one, in order. For conflicts, where the same data changed both on the phone and on the server, I would use a simple rule by default: the newest change wins, based on time. But for anything important, like a shared document, silently overwriting a change could surprise the user. In that case, I would show the conflict and let the user choose.',
        ],
      },
      {
        text: 'Walk me through your process for getting a critical crash fix out to users on both iOS and Android.',
        difficulty: 'Mid',
        track: 'Mobile',
        subQuestions: [
          'How do you confirm the crash and its root cause before writing a fix?',
          'What is different about shipping a fix on iOS versus Android in terms of speed?',
          'What would you do for users who cannot get the update immediately through the store?',
        ],
        hints: [
          'Crash reporting tools (Crashlytics, Sentry) with stack traces and device/OS breakdowns are the starting point — reproduce before you fix.',
          "iOS App Store review can add real delay even with expedited review requests; Android's Play Store rollout is generally faster and supports staged rollouts natively.",
          "For anything remote-configurable (like a feature flag), disabling the crashing code path server-side buys time without waiting on either store's review.",
        ],
        exampleAnswers: [
          "First, I would pull the crash report from a tool like Crashlytics or Sentry. I would look at the error details and which devices are affected. I would try to recreate the problem myself before writing any fix. Once the fix is ready, the two app stores move at different speeds. Android's store is usually fast, and it lets me release to a small group of users first. iOS needs a review from Apple, which I would ask to speed up, since it is a crash fix, but it can still take longer. For users who cannot update right away, if the broken part of the app is behind a feature flag, I would turn it off from the server. This protects users immediately, without waiting for either app store.",
        ],
      },
      {
        text: 'Walk me through how a recording moves from the browser to a stored, transcribed result.',
        difficulty: 'Junior',
        track: 'This App',
        subQuestions: [
          'What happens on the Angular side before the audio is sent?',
          'How does the NestJS backend get the file into S3?',
          'How do transcription and grammar checking fit into that flow without blocking the user too long?',
        ],
        hints: [
          'MediaRecorder captures audio client-side into a Blob, then a multipart FormData POST carries it to the API.',
          'The backend streams the buffer straight to S3 via a scoped IAM credential — no writing to disk first.',
          'Discuss the tradeoff of running transcription/grammar-check synchronously in the request vs. offloading to a queue or background job.',
        ],
        exampleAnswers: [
          "On the Angular side, the MediaRecorder tool records the user's voice into small pieces, and joins them into one file once the user stops. This file is sent to our NestJS server using a normal file upload request. The server sends this file straight to S3 storage, using a limited, safe set of AWS permissions. It never saves the file to its own disk first. After that, it starts transcription and grammar checking on the file. Right now, both of these steps run directly inside the same request, which keeps the code simple. But this means a slow transcription service makes the user wait longer than we would like. At a bigger scale, I would move this work to a background queue, and let the app check back later for the result.",
        ],
      },
      {
        text: 'How would you evolve the database schema safely once this app is running in production?',
        difficulty: 'Senior',
        track: 'This App',
        subQuestions: [
          'Why is `synchronize: true` risky outside of development?',
          'What would replace it?',
          'How do you roll out a schema change with zero downtime?',
        ],
        hints: [
          'synchronize auto-diffs entities against the live DB on every boot — fine for a solo dev box, dangerous with concurrent instances or real user data.',
          'Versioned, explicitly-run migrations (TypeORM migrations or similar) give you reviewable, reversible SQL instead.',
          'Additive-first pattern: add a nullable column, backfill, then tighten constraints in a later deploy — avoid one deploy that both writes and reads a new column at once.',
        ],
        exampleAnswers: [
          'Right now, the setting synchronize: true checks our code against the live database every time the app starts, and changes the database to match. This is easy for one person working alone. But it becomes dangerous with real traffic, because two servers starting at the same time could both try to change the database at once. It also leaves no clear history of what changed and why. I would replace this with real, numbered database migrations. These are written once, checked by a teammate, and run as one clear step during deploy. For a change with zero downtime, I follow a simple pattern: first, add a new column that can be empty, and fill in the old data. Only later, in a separate deploy, do I make that column required. This way, no single release both writes and reads a data shape that is not ready yet.',
        ],
      },
      {
        text: 'Explain the decision to self-host Whisper and LanguageTool instead of calling a paid API for each request.',
        difficulty: 'Mid',
        track: 'This App',
        subQuestions: [
          "What's the cost and latency tradeoff?",
          'What happens if one of those containers is slow or down?',
          'How would this need to change to scale past a single server?',
        ],
        hints: [
          'No per-request billing, but you pay in CPU/RAM per request plus the ops burden of keeping the containers healthy.',
          'Both calls are wrapped so a failure degrades to a null transcript/correction instead of failing the whole upload — talk about graceful degradation.',
          'At real scale you would split these into their own service tier, likely behind a queue, rather than calling them inline from the request thread.',
        ],
        exampleAnswers: [
          'Running our own tools for speech-to-text and grammar checking means we do not pay a cost for every single request. This matters for a product where usage could suddenly grow. But instead, we pay for CPU and memory on our own servers, plus the work of keeping these tools healthy and running. Both of these calls are written so that, if a tool is slow or not working, the upload still finishes. The user just gets an empty result for the transcript or correction, instead of a full failure. This kind of safe fallback was a deliberate choice. To grow past one single server, I would move both of these tools into their own separate service, most likely behind a queue. This way, a sudden wave of uploads does not slow down the main server.',
        ],
      },
      {
        text: 'How do you keep AWS credentials out of the codebase while still letting a local Docker container upload to S3?',
        difficulty: 'Mid',
        track: 'This App',
        subQuestions: [
          'Where do the credentials actually live in this setup?',
          'How is the IAM permission scoped?',
          'How would this differ in a real production deployment?',
        ],
        hints: [
          'A gitignored `.env.local` file loaded by docker-compose, provisioned via a Terraform module — never committed to the repo.',
          'Least privilege: the IAM policy only allows PutObject/GetObject/DeleteObject on one bucket’s objects, not admin access.',
          'Production would use an instance/task role attached to the compute (no static long-lived keys at all) instead of an IAM access key.',
        ],
        exampleAnswers: [
          'On my own computer, the AWS keys live in a local file that is never saved to the code repository. Docker Compose loads this file when it starts. This AWS user was set up using Terraform, so nobody had to type the keys in by hand. The permission for this key is very limited. It can only upload, download, and delete files in one single storage bucket. It cannot do anything else in our AWS account. In a real production system, I would not use a fixed key like this at all. Instead, I would attach a role directly to the server. AWS then creates and rotates the keys automatically, with no fixed secret to manage or leak.',
        ],
      },
      {
        text: 'How would you test a service that makes an outbound HTTP call to another container, like the grammar or transcription service?',
        difficulty: 'Junior',
        track: 'This App',
        subQuestions: [
          'What do you mock, and why?',
          'How do you test the failure path?',
          'Would you ever want a test that hits the real container?',
        ],
        hints: [
          'Mock `fetch` (or the HTTP client) at the unit level — spinning up the real container for every test run is slow and flaky.',
          'Assert the service degrades to null/undefined rather than throwing when the call fails, since that is the actual contract callers rely on.',
          'A small number of integration tests against the real docker-compose stack are worth it to catch wiring bugs the mocks can’t see.',
        ],
        exampleAnswers: [
          'For a normal unit test, I would fake the network call itself, using a mock. Starting the real Whisper or LanguageTool service for every single test would be slow, and it could make tests fail randomly. The most important thing to test is the failure case. I want to check that, if the call fails, the service quietly returns an empty result, instead of crashing the whole request. This is the real promise that the rest of the app depends on. On top of these fast unit tests, I would also keep a small number of slower tests that use the real services together. These catch simple mistakes, like a wrong URL or port, that a fake test cannot see.',
        ],
      },
      {
        text: 'Explain the authentication flow, and name the biggest security gap in the current implementation.',
        difficulty: 'Mid',
        track: 'This App',
        subQuestions: [
          'What happens between login and an authenticated request?',
          'Where is the JWT stored client-side, and what risk does that create?',
          'What would you add before this went in front of real users?',
        ],
        hints: [
          'bcrypt-hashed password check on login issues a JWT, sent as a Bearer token and verified by a guard on each request.',
          'Storage in localStorage is XSS-exposed; httpOnly cookies avoid that but bring CSRF considerations instead — name the one this app actually uses.',
          'No refresh-token rotation and no login rate limiting are the honest gaps worth naming rather than hiding.',
        ],
        exampleAnswers: [
          'When a user logs in, the server checks their password against a saved, hashed version using bcrypt. If it matches, the server creates a JWT token. The app then sends this token with every request after that, and a guard checks it before the request reaches any real code. Right now, this token is saved in a way on the browser that is open to XSS attacks. A safer choice would be an httpOnly cookie. This is the biggest honest gap I would point out first. Before real users use this app, I would also add a limit on login attempts, to slow down password-guessing attacks. And I would add a way to safely refresh tokens, so a stolen token does not stay valid forever.',
        ],
      },
      {
        text: 'Walk me through how XP gets awarded when someone saves a recording, and what gap would you close first?',
        difficulty: 'Mid',
        track: 'This App',
        subQuestions: [
          'Where does the XP amount come from, and how is it added to the user total?',
          'What is the biggest gap in the current design?',
          'How would you close it without a big rewrite?',
        ],
        hints: [
          'Every successful recording upload flatly awards a fixed amount of XP, regardless of answer length, quality, or whether it duplicates a prior attempt.',
          'The increment itself uses an atomic SQL UPDATE (Repository.increment) rather than a read-modify-write, so it is safe under concurrent requests — that part is solid.',
          'The gap is on the earning side, not the accounting side: no cap, no streak logic, no dedup for re-recording the same (sub)question repeatedly.',
        ],
        exampleAnswers: [
          "Every time someone saves a recording, the server gives a fixed amount of XP and adds it to their total. This uses a safe, single database command, instead of reading the number, changing it in code, and saving it back. So this part is safe, even if many requests happen at the same time. The real gap is somewhere else. The XP given is the same, whether it is someone's very first try at a new question, or their tenth repeat of an old one. This means XP can be earned without much real effort. To fix this, without changing the safe part at all, I would first check if this exact question has already earned XP for this user, before giving it again.",
        ],
      },
      {
        text: 'The practice view uses several Angular signals and two separate effects that both react to the same input. Why split them instead of using one effect?',
        difficulty: 'Mid',
        track: 'This App',
        subQuestions: [
          'What does each of the two effects actually do?',
          'What would go wrong, or get harder to reason about, if they were merged into one?',
          'How does XP flow from a saved recording back up to the rest of the app, given there is no shared store?',
        ],
        hints: [
          'One effect refetches recordings from the API when the question changes; the other resets example-answer state — different concerns, different failure modes.',
          'A single merged effect would re-run in full every time either concern needed to react, coupling two unrelated pieces of state.',
          "XP is emitted as a plain output() up to the parent and pushed into the auth service's user signal — prop drilling of a primitive, not a shared XP store.",
        ],
        exampleAnswers: [
          "There are two separate effects, and both react when the current question's ID changes. One effect loads the saved recordings for that question from the server. The other one resets the example-answer panel, so an old example from the last question does not stay on screen by mistake. They are kept separate because they are truly different jobs, with different ways to fail. One is a network call that can fail; the other is a simple, instant reset. If I combined them into one big effect, any future change to one job could accidentally affect the other. As for XP, there is no shared store for it at all. When a recording is saved, the component sends its new XP total up to the parent using a simple output. The parent then updates a signal in the login service, and any other part of the app that needs it just reads that same signal.",
        ],
      },
      {
        text: 'The Question entity eager-loads its sub-questions on every query. What is the tradeoff, and where does it show up in the recordings stats endpoint?',
        difficulty: 'Senior',
        track: 'This App',
        subQuestions: [
          'What does `eager: true` actually change about a normal `find()` call?',
          'What is the cost of that, and when would it become a real problem?',
          'What does `/api/recordings/stats` actually return, despite its name?',
        ],
        hints: [
          '`@OneToMany(..., { eager: true })` means every Question fetch anywhere in the app automatically joins and loads its sub-questions, whether the caller needs them or not.',
          'That is fine at small scale but becomes an over-fetch and potential N+1 risk once question lists or nesting grow, since callers have no way to opt out.',
          '`/recordings/stats` sounds like it should return grouped analytics, but it just returns a single `{ totalCount }` from one COUNT(*) scoped to the current user — no grouping by category or question at all.',
        ],
        exampleAnswers: [
          'Because the sub-questions relation is marked as eager, every single time we load a Question anywhere in the app, it automatically also loads all of its sub-questions. This happens even in places that never actually use them, like a simple check to see if a question exists. This is fine and even helpful for the practice screen, which always needs the sub-questions. But everywhere else, it means loading more data than needed, and it could become a real performance problem if question lists grow bigger. There is currently no way for other parts of the code to skip this extra loading. The stats endpoint shows a similar pattern. Its name suggests it should return detailed numbers, grouped by category or question. But right now, it only returns one single total count for the logged-in user, with no grouping at all.',
        ],
      },
      {
        text: 'What happens if CORS_ORIGIN is left unset, and why is that a real risk?',
        difficulty: 'Mid',
        track: 'This App',
        subQuestions: [
          'What does the CORS configuration actually do when the environment variable is missing?',
          'Why is that dangerous specifically in production, when it might look harmless in dev?',
          'What else is missing alongside it that you would want before real users hit this API?',
        ],
        hints: [
          'The code falls back to `origin: true` when CORS_ORIGIN is unset, which reflects whatever origin sent the request rather than restricting to a known list.',
          'In dev that just means "everything works," but in production it means any website can make authenticated-looking cross-origin requests against the API.',
          'There is also no rate limiting anywhere in the API — no @nestjs/throttler or equivalent — so this sits alongside another real gap, not in isolation.',
        ],
        exampleAnswers: [
          'If the CORS_ORIGIN setting is left empty, the server falls back to allowing any website that sends a request. In other words, there is no real limit at all. During development, this is invisible, because everything simply works without extra setup. But in production, it means any website on the internet could send requests to our API and have them accepted. This defeats the whole purpose of having CORS protection in the first place. Before real users use this app, I would make CORS_ORIGIN a required setting, with no open fallback allowed. I would also add rate limiting to the API at the same time, since neither of these exist right now. Together, these two gaps are the difference between a small annoyance and a real security risk.',
        ],
      },
    ],
  },
];

// Older seed runs created a separate "Tech Stack" category. It has since
// been folded into "Technical" (with a `track` of "This App"); this merges
// any pre-existing "Tech Stack" rows into "Technical" so nothing is
// duplicated or orphaned on re-seed.
async function mergeLegacyTechStackCategory(
  categoriesRepo: Repository<Category>,
  questionsRepo: Repository<Question>,
) {
  const legacy = await categoriesRepo.findOne({
    where: { title: 'Tech Stack' },
  });
  if (!legacy) return;

  let technical = await categoriesRepo.findOne({
    where: { title: 'Technical' },
  });
  if (!technical) {
    technical = await categoriesRepo.save(
      categoriesRepo.create({
        title: 'Technical',
        subtitle: 'Frontend, Backend, DevOps & Mobile',
        color: 'bg-yellow-400',
        icon: '💻',
      }),
    );
  }

  const legacyQuestions = await questionsRepo.find({
    where: { category: { id: legacy.id } },
  });
  for (const question of legacyQuestions) {
    question.category = technical;
    if (!question.track) question.track = 'This App';
    await questionsRepo.save(question);
  }

  await categoriesRepo.delete(legacy.id);
  console.log('Merged legacy "Tech Stack" category into "Technical".');
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const categoriesRepo = app.get<Repository<Category>>(
    getRepositoryToken(Category),
  );
  const questionsRepo = app.get<Repository<Question>>(
    getRepositoryToken(Question),
  );

  await mergeLegacyTechStackCategory(categoriesRepo, questionsRepo);

  for (const group of SEED_DATA) {
    let category = await categoriesRepo.findOne({
      where: { title: group.category.title },
    });

    if (!category) {
      category = await categoriesRepo.save(
        categoriesRepo.create(group.category),
      );
    } else if (
      category.subtitle !== group.category.subtitle ||
      category.icon !== group.category.icon ||
      category.color !== group.category.color
    ) {
      category.subtitle = group.category.subtitle;
      category.icon = group.category.icon;
      category.color = group.category.color;
      await categoriesRepo.save(category);
    }

    for (const q of group.questions) {
      const existingQuestion = await questionsRepo.findOne({
        where: { text: q.text, category: { id: category.id } },
      });

      if (existingQuestion) {
        let changed = false;
        const sameAnswers =
          existingQuestion.exampleAnswers?.length === q.exampleAnswers.length &&
          existingQuestion.exampleAnswers.every(
            (answer, i) => answer === q.exampleAnswers[i],
          );
        if (!sameAnswers) {
          existingQuestion.exampleAnswers = q.exampleAnswers;
          changed = true;
        }
        if (!existingQuestion.track && q.track) {
          existingQuestion.track = q.track;
          changed = true;
        }
        if (!existingQuestion.stack && q.stack) {
          existingQuestion.stack = q.stack;
          changed = true;
        }
        if (!existingQuestion.difficulty && q.difficulty) {
          existingQuestion.difficulty = q.difficulty;
          changed = true;
        }
        if (changed) {
          await questionsRepo.save(existingQuestion);
          console.log(`Synced fields for: "${q.text}"`);
        }
        continue;
      }

      const question = questionsRepo.create({
        text: q.text,
        hints: q.hints,
        exampleAnswers: q.exampleAnswers,
        track: q.track ?? null,
        stack: q.stack ?? null,
        difficulty: q.difficulty ?? null,
        category,
        subQuestions: q.subQuestions.map(
          (text, index): Partial<SubQuestion> => ({ text, orderIndex: index }),
        ),
      });
      await questionsRepo.save(question);
    }
  }

  console.log('Seed complete.');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
