declare module "@/firebase" {
  import { Auth } from "firebase/auth"
  import { Firestore } from "firebase/firestore"

  export const auth: Auth
  export const db: Firestore
  export default void
}
