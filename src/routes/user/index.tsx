import { createFileRoute } from "@tanstack/react-router";
import { Key, Link as LinkIcon, Monitor, Palette, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/user/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto min-h-screen max-w-4xl bg-white px-6 py-12">
      <Tabs className="w-full" defaultValue="account">
        {/* Tab Navigation */}
        <TabsList className="no-scrollbar mb-10 flex h-auto w-full items-center justify-start gap-8 overflow-x-auto rounded-none border-slate-100 border-b bg-transparent p-0">
          <TabsTrigger
            className="flex items-center gap-2 rounded-none bg-transparent px-0 py-3 font-semibold text-slate-400 shadow-none transition-all data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
            value="account"
          >
            <User className="size-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2 rounded-none border-transparent border-b-2 bg-transparent px-0 py-3 font-semibold text-slate-400 shadow-none transition-all data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
            value="appearance"
          >
            <Palette className="size-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2 rounded-none border-transparent border-b-2 bg-transparent px-0 py-3 font-semibold text-slate-400 shadow-none transition-all data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
            value="connections"
          >
            <LinkIcon className="size-4" />
            <span>Connections</span>
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2 rounded-none border-transparent border-b-2 bg-transparent px-0 py-3 font-semibold text-slate-400 shadow-none transition-all data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
            value="sessions"
          >
            <Monitor className="size-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger
            className="flex items-center gap-2 rounded-none border-transparent border-b-2 bg-transparent px-0 py-3 font-semibold text-slate-400 shadow-none transition-all data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
            value="password"
          >
            <Key className="size-4" />
            <span>Password</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          className="fade-in animate-in space-y-12 outline-none duration-500"
          value="account"
        >
          <header>
            <h1 className="font-bold text-2xl text-slate-900 tracking-tight">Account</h1>
          </header>

          {/* Avatar Section */}
          <section className="flex items-start justify-between py-2">
            <div className="space-y-1.5">
              <h2 className="font-bold text-[17px] text-slate-900">Avatar</h2>
              <p className="font-medium text-[15px] text-slate-500">
                Click avatar to change profile picture.
              </p>
            </div>
            <div className="group relative mr-2 cursor-pointer">
              <div className="size-[120px] overflow-hidden rounded-full border border-slate-100 bg-slate-50 shadow-sm ring-4 ring-slate-50/50 transition-transform duration-300 hover:scale-105">
                <img
                  alt="Profile Avatar"
                  className="h-full w-full object-cover"
                  src="/avatar_illustration.png"
                />
              </div>
              <div className="absolute top-0 -right-1 flex size-7 items-center justify-center rounded-full border-[3px] border-white bg-[#3B82F6] shadow-lg transition-transform hover:scale-110">
                <X className="size-3.5 stroke-[3px] text-white" />
              </div>
            </div>
          </section>

          <Separator className="bg-slate-100/80" />

          {/* Name & Email Section */}
          <section className="space-y-1.5 py-2">
            <h2 className="font-bold text-[17px] text-slate-900">Name & Email address</h2>
            <p className="font-semibold text-[16px] text-slate-600">谢飞太, xiefeitai@gmail.com</p>
          </section>

          <Separator className="bg-slate-100/80" />

          {/* Current Sign In Section */}
          <section className="flex items-center justify-between py-2">
            <div className="space-y-1.5">
              <h2 className="font-bold text-[17px] text-slate-900">Current sign in</h2>
              <p className="font-medium text-[15px] text-slate-500">
                You are signed in as xiefeitai@gmail.com
              </p>
            </div>
            <Button
              className="h-11 rounded-xl border-slate-200 px-5 font-bold text-slate-800 shadow-none hover:bg-slate-50"
              variant="outline"
            >
              Sign out
            </Button>
          </section>

          <Separator className="bg-slate-100/80" />

          {/* Delete Account Section */}
          <section className="flex items-center justify-between py-2">
            <div cla sName="space-y-1.5 ">
              (<h2 className="font-bold text-[17px] text-slate-900">Delete account</h2>
              <p className="font-medium text-[15px] text-slate-500">
                Permanently delete your account.
              </p>
              );
            </div>

            <Button
              className="h-11 rounded-xl border-none bg-[#FF0000] px-7 font-bold shadow-none hover:bg-[#E60000]"
              variant="destructive"
            >
              Delete
            </Button>
          </section>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="slide-in-from-bottom-4 animate-in space-y-4 py-20 text-center duration-500">
            <Palette className="mx-auto size-12 text-slate-200" />
            <div className="font-medium text-slate-400">Appearance settings coming soon...</div>
          </div>
        </TabsContent>
        {/* Other tabs can be added similarly */}
      </Tabs>
    </div>
  );
}
