declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    STUDY_PIN?: string;
    SESSION_SECRET?: string;
    BUCKET?: R2Bucket;
  }
}
