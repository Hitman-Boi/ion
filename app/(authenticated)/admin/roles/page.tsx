import { getRoles } from "@/app/actions/roles";
import { RoleForm } from "@/components/admin/role-form";
import { RolePathEditor } from "@/components/admin/role-path-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { Header } from "@/components/header";

export default async function AdminRolesPage() {
  const roles = await getRoles();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Roles</h1>
            <p className="text-muted-foreground">Define career paths and role requirements.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Role</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <RoleForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role: any) => (
            <Card key={role.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {role.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  {role.description || "No description"}
                </p>

                <Separator className="my-2" />

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold">Career Paths (Incoming)</h4>
                  {role.paths.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No paths defined</p>
                  ) : (
                    <ul className="text-xs space-y-1">
                      {role.paths.map((path: any) => (
                        <li key={path.id} className="flex items-center gap-1">
                          <span className="text-muted-foreground">from</span>
                          <span className="font-medium">
                            {/* @ts-ignore - Prisma include relation */}
                            {path.sourceRoleId ? roles.find((r: any) => r.id === path.sourceRoleId)?.title : "Entry Level"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full mt-2">Add Path</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Path to {role.title}</DialogTitle>
                      </DialogHeader>
                      <RolePathEditor roles={roles} targetRole={role} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
