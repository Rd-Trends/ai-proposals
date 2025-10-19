// import { Briefcase, FolderOpen, TrendingUp, Trophy } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { getUserProjectStats } from "@/db/operations/project";
// import type { User } from "@/lib/auth-client";
// import { Skeleton } from "../ui/skeleton";

// const ProjectStats = async ({ user }: { user: User }) => {
//   const stats = await getUserProjectStats(user.id);

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
//           <FolderOpen className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold">{stats.totalProjects}</div>
//           <p className="text-xs text-muted-foreground">
//             {stats.completedProjects} completed
//           </p>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Case Studies</CardTitle>
//           <Trophy className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold">{stats.caseStudies}</div>
//           <p className="text-xs text-muted-foreground">Showcase projects</p>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Client Work</CardTitle>
//           <Briefcase className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold">{stats.clientWork}</div>
//           <p className="text-xs text-muted-foreground">Professional projects</p>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium">Categories</CardTitle>
//           <TrendingUp className="h-4 w-4 text-muted-foreground" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold">
//             {stats.projectsByCategory.length}
//           </div>
//           <p className="text-xs text-muted-foreground">
//             {stats.projectsByCategory.length > 0 ? (
//               <span>
//                 Top: {stats.projectsByCategory[0]?.category || "None"}
//               </span>
//             ) : (
//               "No categories yet"
//             )}
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// const ProjectStatsLoader = () => {
//   const skeletonCards = ["total", "case-studies", "client-work", "categories"];

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//       {skeletonCards.map((cardType) => (
//         <Card key={cardType}>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <Skeleton className="h-4 w-20" />
//             <Skeleton className="h-4 w-4" />
//           </CardHeader>
//           <CardContent>
//             <Skeleton className="h-8 w-16 mb-2" />
//             <Skeleton className="h-3 w-24" />
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// };

// export { ProjectStats, ProjectStatsLoader };
