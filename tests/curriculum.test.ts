import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { COURSES, LAB_CATALOG, LEARNING_PATHS, LESSONS } from '@/data/curriculum';
import { LESSON_INDEX } from '@/data/lessonIndex.generated';
import { renderLessonIndex } from '../scripts/generate-lesson-index';

const slugs = LESSONS.map((l) => l.slug);
const slugSet = new Set(slugs);

describe('curriculum integrity', () => {
  it('has unique lesson slugs', () => {
    expect(slugSet.size).toBe(slugs.length);
  });

  it('puts every lesson in exactly one course, matching its courseId and path', () => {
    const owners = new Map<string, string[]>();
    for (const course of COURSES) {
      for (const slug of course.lessonSlugs) owners.set(slug, [...(owners.get(slug) ?? []), course.id]);
    }
    for (const lesson of LESSONS) {
      expect(owners.get(lesson.slug), lesson.slug).toEqual([lesson.courseId]);
      const course = COURSES.find((c) => c.id === lesson.courseId)!;
      expect(course.pathSlug, lesson.slug).toBe(lesson.pathSlug);
    }
  });

  it('only references lessons that exist', () => {
    for (const course of COURSES) {
      for (const slug of course.lessonSlugs) expect(slugSet.has(slug), `${course.id} -> ${slug}`).toBe(true);
    }
    for (const lab of LAB_CATALOG) {
      expect(slugSet.has(lab.relatedLessonSlug), `${lab.id} -> ${lab.relatedLessonSlug}`).toBe(true);
    }
  });

  it('wires every path to existing courses', () => {
    const courseIds = new Set(COURSES.map((c) => c.id));
    for (const p of LEARNING_PATHS) {
      for (const id of p.courseIds) expect(courseIds.has(id), `${p.slug} -> ${id}`).toBe(true);
    }
  });

  it('uses valid lab ids on lessons', () => {
    const labIds = new Set(LAB_CATALOG.map((l) => l.id));
    for (const lesson of LESSONS) {
      if (lesson.interactiveLabId) expect(labIds.has(lesson.interactiveLabId), lesson.slug).toBe(true);
    }
  });

  it('has well-formed quizzes', () => {
    for (const lesson of LESSONS) {
      const ids = new Set<string>();
      for (const q of lesson.quiz) {
        expect(ids.has(q.id), `${lesson.slug}: duplicate quiz id ${q.id}`).toBe(false);
        ids.add(q.id);
        expect(q.options.length, `${lesson.slug}/${q.id}`).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex, `${lesson.slug}/${q.id}`).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex, `${lesson.slug}/${q.id}`).toBeLessThan(q.options.length);
      }
    }
  });

  it('uses https or site-relative resource links', () => {
    for (const lesson of LESSONS) {
      for (const r of lesson.resources) {
        expect(r.url, `${lesson.slug}: ${r.title}`).toMatch(/^(https:\/\/|\/[a-z])/);
      }
    }
  });
});

describe('generated lesson index', () => {
  it('matches the curriculum (run `npm run generate:index` if this fails)', () => {
    const onDisk = readFileSync(path.join(__dirname, '../src/data/lessonIndex.generated.ts'), 'utf8');
    expect(onDisk).toBe(renderLessonIndex());
    expect(LESSON_INDEX.map((l) => l.slug)).toEqual(slugs);
  });
});
