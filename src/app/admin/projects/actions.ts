"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { done, fail, logActivity, notifyClient, safeFileName, str } from "@/lib/actions";
import { linkDeliverableSchema, milestoneSchema, projectSchema, projectUpdateSchema } from "@/lib/validation";

const LIST = "/admin/projects";
const detail = (id: string) => `${LIST}/${id}`;
const UUID = /^[0-9a-f-]{36}$/i;

// Keep uploads small so they work on typical hosting limits. Use link deliverables for big videos.
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "png", "jpg", "jpeg", "webp", "gif", "zip", "docx", "xlsx", "pptx", "txt", "mp3"];

export async function createProjectAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const parsed = projectSchema.safeParse({
    client_id: str(fd, "client_id"),
    service_id: str(fd, "service_id"),
    title: str(fd, "title"),
    description: str(fd, "description"),
    status: str(fd, "status") || "planning",
    start_date: str(fd, "start_date"),
    deadline: str(fd, "deadline"),
  });
  if (!parsed.success) fail(LIST, parsed.error.issues[0].message);

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...parsed.data, created_by: user.id })
    .select("id")
    .single();
  if (error || !data) fail(LIST, "Could not create the project.");
  await logActivity(supabase, user.id, "project.create", "project", data.id, { title: parsed.data.title });
  await notifyClient(supabase, parsed.data.client_id, "New project", `Project "${parsed.data.title}" was created.`, `/portal/projects/${data.id}`);
  revalidatePath(LIST);
  redirect(`${detail(data.id)}?ok=${encodeURIComponent("Project created.")}`);
}

export async function updateProjectAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const id = str(fd, "id");
  if (!UUID.test(id)) fail(LIST, "Invalid request.");
  const parsed = projectUpdateSchema.safeParse({
    id,
    title: str(fd, "title"),
    status: str(fd, "status"),
    progress: str(fd, "progress"),
    deadline: str(fd, "deadline"),
  });
  if (!parsed.success) fail(detail(id), parsed.error.issues[0].message);

  const { data, error } = await supabase
    .from("projects")
    .update({
      title: parsed.data.title,
      status: parsed.data.status,
      progress: parsed.data.progress,
      deadline: parsed.data.deadline,
    })
    .eq("id", id)
    .select("client_id")
    .single();
  if (error || !data) fail(detail(id), "Could not update the project.");
  await logActivity(supabase, user.id, "project.update", "project", id, { status: parsed.data.status, progress: parsed.data.progress });
  await notifyClient(
    supabase,
    data.client_id,
    "Project update",
    `"${parsed.data.title}" is now ${parsed.data.status.replace("_", " ")} (${parsed.data.progress}% complete).`,
    `/portal/projects/${id}`,
  );
  revalidatePath(detail(id));
  done(detail(id), "Project updated.");
}

export async function addMilestoneAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const parsed = milestoneSchema.safeParse({
    project_id: str(fd, "project_id"),
    title: str(fd, "title"),
    due_date: str(fd, "due_date"),
  });
  if (!parsed.success) fail(LIST, parsed.error.issues[0].message);
  const id = parsed.data.project_id;
  const { error } = await supabase.from("milestones").insert(parsed.data);
  if (error) fail(detail(id), "Could not add the milestone.");
  await logActivity(supabase, user.id, "milestone.add", "project", id);
  revalidatePath(detail(id));
  done(detail(id), "Milestone added.");
}

export async function toggleMilestoneAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const id = str(fd, "id");
  const projectId = str(fd, "project_id");
  if (!UUID.test(id) || !UUID.test(projectId)) fail(LIST, "Invalid request.");
  const isDone = str(fd, "done") === "1";
  const { error } = await supabase.from("milestones").update({ is_done: isDone }).eq("id", id).eq("project_id", projectId);
  if (error) fail(detail(projectId), "Could not update the milestone.");
  await logActivity(supabase, user.id, "milestone.toggle", "project", projectId, { done: isDone });
  revalidatePath(detail(projectId));
  done(detail(projectId), "Milestone updated.");
}

export async function addLinkDeliverableAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const parsed = linkDeliverableSchema.safeParse({
    project_id: str(fd, "project_id"),
    title: str(fd, "title"),
    url: str(fd, "url"),
  });
  if (!parsed.success) fail(LIST, parsed.error.issues[0].message);
  const id = parsed.data.project_id;
  const { data: project } = await supabase.from("projects").select("client_id,title").eq("id", id).single();
  const { error } = await supabase
    .from("deliverables")
    .insert({ project_id: id, title: parsed.data.title, kind: "link", url: parsed.data.url, created_by: user.id });
  if (error) fail(detail(id), "Could not add the link.");
  await logActivity(supabase, user.id, "deliverable.link", "project", id);
  if (project) await notifyClient(supabase, project.client_id, "New deliverable", `${parsed.data.title} is ready.`, `/portal/projects/${id}`);
  revalidatePath(detail(id));
  done(detail(id), "Link added.");
}

export async function uploadDeliverableAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin", "staff"]);
  const id = str(fd, "project_id");
  if (!UUID.test(id)) fail(LIST, "Invalid request.");
  const title = str(fd, "title");
  const file = fd.get("file");
  if (title.length < 2) fail(detail(id), "Enter a title for the file.");
  if (!(file instanceof File) || file.size === 0) fail(detail(id), "Choose a file to upload.");
  if (file.size > MAX_FILE_BYTES) fail(detail(id), "File is too large (max 4 MB). Use a link for big files such as videos.");
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) fail(detail(id), `File type .${ext} is not allowed.`);

  const path = `${id}/${Date.now()}-${safeFileName(file.name)}`;
  const { error: upErr } = await supabase.storage.from("deliverables").upload(path, file, { contentType: file.type || undefined });
  if (upErr) fail(detail(id), "Upload failed.");

  const { error } = await supabase
    .from("deliverables")
    .insert({ project_id: id, title, kind: "file", storage_path: path, created_by: user.id });
  if (error) {
    await supabase.storage.from("deliverables").remove([path]);
    fail(detail(id), "Could not save the file record.");
  }
  const { data: project } = await supabase.from("projects").select("client_id").eq("id", id).single();
  await logActivity(supabase, user.id, "deliverable.upload", "project", id, { title });
  if (project) await notifyClient(supabase, project.client_id, "New deliverable", `${title} is ready to download.`, `/portal/projects/${id}`);
  revalidatePath(detail(id));
  done(detail(id), "File uploaded.");
}

export async function deleteDeliverableAction(fd: FormData) {
  const { supabase, user } = await requireRole(["admin"]);
  const id = str(fd, "id");
  const projectId = str(fd, "project_id");
  if (!UUID.test(id) || !UUID.test(projectId)) fail(LIST, "Invalid request.");
  const { data: row } = await supabase.from("deliverables").select("storage_path").eq("id", id).single();
  const { error } = await supabase.from("deliverables").delete().eq("id", id).eq("project_id", projectId);
  if (error) fail(detail(projectId), "Could not delete.");
  if (row?.storage_path) await supabase.storage.from("deliverables").remove([row.storage_path]);
  await logActivity(supabase, user.id, "deliverable.delete", "project", projectId);
  revalidatePath(detail(projectId));
  done(detail(projectId), "Deliverable deleted.");
}
