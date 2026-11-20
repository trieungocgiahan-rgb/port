import { StoreProvider, useRoute } from './lib.jsx';
import { Banner, Nav } from './components.jsx';
import Landing from './screens/Landing.jsx';
import Quiz from './screens/Quiz.jsx';
import Plan from './screens/Plan.jsx';
import { Tools, DeadlineTracker, CssWalkthrough } from './screens/Tools.jsx';
import { EssayReview, ProfileReview, FullReview } from './screens/AiTools.jsx';
import Community from './screens/Community.jsx';
import { MentorPrefs, MentorMatches, MentorProfile, Booking, Booked } from './screens/Mentors.jsx';
import { Packages, ProfileCheck } from './screens/Packages.jsx';

function Screen({ route }) {
  // Full-screen views without the app nav
  if (route === '' || route === 'home') return <Landing />;
  if (route === 'quiz') return <Quiz />;

  let section = route.split('-')[0];
  let body;
  if (route === 'plan') body = <Plan />;
  else if (route === 'tools') body = <Tools />;
  else if (route === 'tool-deadlines') { section = 'tools'; body = <DeadlineTracker />; }
  else if (route === 'tool-css') { section = 'tools'; body = <CssWalkthrough />; }
  else if (route === 'tool-essay') { section = 'tools'; body = <EssayReview />; }
  else if (route === 'tool-profile') { section = 'tools'; body = <ProfileReview />; }
  else if (route === 'tool-full') { section = 'tools'; body = <FullReview />; }
  else if (route === 'community') body = <Community />;
  else if (route === 'mentors') body = <MentorPrefs />;
  else if (route === 'matches') { section = 'mentors'; body = <MentorMatches />; }
  else if (route.startsWith('mentor-')) { section = 'mentors'; body = <MentorProfile id={route.slice(7)} />; }
  else if (route.startsWith('book-')) { section = 'mentors'; body = <Booking id={route.slice(5)} />; }
  else if (route === 'booked') { section = 'mentors'; body = <Booked />; }
  else if (route === 'packages') body = <Packages />;
  else if (route === 'profile-check') { section = 'packages'; body = <ProfileCheck />; }
  else return <Landing />;

  return (
    <div className="shell">
      <Nav section={section} />
      <main>{body}</main>
    </div>
  );
}

export default function App() {
  const route = useRoute();
  return (
    <StoreProvider>
      <Banner />
      <Screen route={route} />
    </StoreProvider>
  );
}
