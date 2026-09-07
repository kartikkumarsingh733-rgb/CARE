// App root — redirect to Elder mode by default
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(elder)" />;
}
