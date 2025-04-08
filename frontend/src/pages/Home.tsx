import ZHelloWorld from "@/components/boxify/ZHelloWorld";
import { BoxContainer, BoxProps } from "../components/boxify/BoxInterface";

export default function Home() {
  /**
   * BoxModules Configuration:
   * - id: Unique identifier for the box, used for DOM identification
   * - label: Display name shown to users in the UI
   * - component: React component to render inside the box
   * - theme: Styling configuration for the box
   *   - dark: CSS class for dark mode
   *   - light: CSS class for light mode
   */
  const boxModules: BoxProps[] = [
    {
      id: "hello-world-box",
      label: "Hello World",
      component: ZHelloWorld,
      theme: {
        dark: "bg-red-800",
        light: "bg-red-200",
      },
    },
  ];

  return (
    <div className="dark:text-white p-4 mx-auto">
      <BoxContainer modules={boxModules} />
    </div>
  );
}
