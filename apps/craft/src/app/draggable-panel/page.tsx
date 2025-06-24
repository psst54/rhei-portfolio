import { Footer } from "@rhei/ui";
import Screen from "./_components/Screen";

export default function Page() {
  return (
    <>
      <main className="content-x">
        <h1 className="mx-auto w-full max-w-6xl text-[2rem] font-bold">
          draggable panel
        </h1>

        <section className="mx-auto mt-4 flex w-full max-w-6xl flex-col gap-8">
          <Screen />
        </section>
      </main>

      <Footer />
    </>
  );
}
