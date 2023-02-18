// This file defines our "mutators".
//
// Mutators are how you change data in Replicache apps.
//
// They are registered with Replicache at construction-time and callable like:
// `myReplicache.mutate.createTodo({text: "foo"})`.
//
// Replicache runs each mutation immediately (optimistically) on the client,
// against the local cache, and then later (usually moments later) sends a
// description of the mutation (its name and arguments) to the server, so that
// the server can *re-run* the mutation there against the authoritative
// datastore.
//
// This re-running of mutations is how Replicache handles conflicts: the
// mutators defensively check the database when they run and do the appropriate
// thing. The Replicache sync protocol ensures that the server-side result takes
// precedence over the client-side optimistic result.
//
// If the server is written in JavaScript, the mutator functions can be directly
// reused on the server. This sample demonstrates the pattern by using these
// mutators both with Replicache on the client (see [id]].tsx) and on the server
// (see pages/api/replicache/[op].ts).
//
// See https://doc.replicache.dev/how-it-works#sync-details for all the detail
// on how Replicache syncs and resolves conflicts, but understanding that is not
// required to get up and running.

import type { WriteTransaction } from "replicache";

import { Todo, listTodos, TodoUpdate } from "./todo";

export type M = typeof mutators;

export const mutators = {
  updateTodo: async (tx: WriteTransaction, update: TodoUpdate) => {
    // In a real app you may want to validate the incoming data is in fact a
    // TodoUpdate. Check out https://www.npmjs.com/package/@rocicorp/rails for
    // some heper functions to do this.
    const prev = (await tx.get(update.id)) as Todo;
    const next = { ...prev, ...update };
    await tx.put(next.id, next);
  },

  deleteTodo: async (tx: WriteTransaction, id: string) => {
    await tx.del(id);
  },

  // This mutator creates a new todo, assigning the next available sort value.
  //
  // If two clients create new todos concurrently, they both might choose the
  // same sort value locally (optimistically). That's fine because later when
  // the mutator re-runs on the server the two todos will get unique values.
  //
  // Replicache will automatically sync the change back to the clients,
  // reconcile any changes that happened client-side in the meantime, and update
  // the UI to reflect the changes.
  createTodo: async (tx: WriteTransaction, todo: Omit<Todo, "sort">) => {
    const todos = await listTodos(tx);
    todos.sort((t1, t2) => t1.sort - t2.sort);

    const maxSort = todos.pop()?.sort ?? 0;
    await tx.put(todo.id, { ...todo, sort: maxSort + 1 });
  },
};
