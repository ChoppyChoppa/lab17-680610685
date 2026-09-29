import { z } from "zod";
import type { Course } from "@/lib/types";

export const COURSE_TITLE_MAX = 100;
export const MAX_INSTRUCTORS = 3;
export const DESCRIPTION_MAX = 100;

export const courseFormSchema = z.object({
  courseId: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก"),
  courseTitle: z
    .string()
    .trim()
    .min(1, "กรอกชื่อวิชา")
    .max(
      COURSE_TITLE_MAX,
      `ชื่อวิชายาวได้ไม่เกิน ${COURSE_TITLE_MAX} ตัวอักษร`,
    ),
  program: z.enum(["CPE", "ISNE"], { message: "เลือกหลักสูตร" }),
  semester: z.enum(["1", "2", "3"], { message: "เลือกภาคการศึกษา" }),
  description: z
    .string()
    .max(DESCRIPTION_MAX, `รายละเอียดต้องไม่เกิน ${DESCRIPTION_MAX} ตัวอักษร`),
  instructors: z
    .array(
      z.object({
        name: z.string().trim().min(1, "กรอกชื่อผู้สอน"),
        email: z
          .string()
          .trim()
          .pipe(z.email("กรุณากรอกอีเมลให้ถูกต้อง"))
          .refine((email) => email.endsWith("@cmu.ac.th"), {
            message: "อีเมลต้องลงท้ายด้วย @cmu.ac.th",
          }),
      }),
    )
    .min(1, "ต้องมีผู้สอนอย่างน้อย 1 คน")
    .max(MAX_INSTRUCTORS, `เพิ่มผู้สอนได้ไม่เกิน ${MAX_INSTRUCTORS} คน`)
    .refine(
      (instructors) =>
        new Set(instructors.map(({ email }) => email.toLowerCase())).size ===
        instructors.length,
      "อีเมลผู้สอนซ้ำกัน",
    ),
  notifyByEmail: z.boolean(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const emptyCourseForm = {
  courseId: "",
  courseTitle: "",
  program: undefined,
  semester: undefined,
  description: "",
  instructors: [{ name: "", email: "" }],
  notifyByEmail: false,
} satisfies import("react-hook-form").DefaultValues<CourseFormValues>;

export function createCourseFormSchema(existingCourses: Course[]) {
  return courseFormSchema.refine(
    (data) =>
      !existingCourses.some((course) => course.courseId === data.courseId),
    { message: "รหัสวิชานี้มีอยู่แล้ว", path: ["courseId"] },
  );
}
