/**
 * Material in the Drive archive that is deliberately NOT published.
 *
 * Nothing here is imported by the site. `npm run check:private` fails the build check
 * if any of these Drive IDs or filenames appear in the source content or the built output.
 * To publish one later: confirm written permission, add it to projects.ts, remove it here.
 */
export type Withheld = { folder: string; reason: string; driveIds: string[]; files: string[] };

export const withheld: Withheld[] = [
  {
    folder: "Dani Naming Ceremony",
    reason: "Private family event with a newborn. Needs the family's written permission.",
    driveIds: ["1OX26uc_KRzKJm78dUSs0Ecj7uY0ifMrj"],
    files: ["Dani.mov"],
  },
  {
    folder: "Rhema's Birthday",
    reason: "Children's party; children are identifiable. Licensed-character decor.",
    driveIds: ["1xKeoA3tb9LK4dx0ZDygBBlwaX8JooE8P"],
    files: ["copy_73110600-645D-4252-B252-A23783A1641B.mov"],
  },
  {
    folder: "Dani's Baby Shower",
    reason: "Private family event; signage shows private names and a date.",
    driveIds: ["1KRio8QKezo-43aiJUyOQXK5qXNRGm_-Y", "1dQRFDxAf8usIY94XQYY_3WFseHFDKt0x"],
    files: [
      "copy_873E2B03-FB5A-4631-8092-9008DC33E474.mov",
      "copy_072FB56D-8255-4BC1-9B86-4B27FE9D017B.mov",
    ],
  },
  {
    folder: "Dani!",
    reason: "Linked to the same private family events; permission not confirmed.",
    driveIds: ["1WNBqJfSlbcqSR5cZDSx2qlN-qR-2xRqL"],
    files: ["copy_0B8E1075-BE92-45E3-9FBC-75E2A89AB6E4.mov"],
  },
  {
    folder: "Venessa's Sexy Slumber",
    reason: "Private birthday party; guests have not consented.",
    driveIds: ["1fcxikcEFefgCySo-QMeA6Ih4wUE4PYOU"],
    files: ["copy_1054A181-11A8-4653-B440-00CCCB5D23EA.MOV"],
  },
  {
    folder: "Ojude Oba",
    reason:
      "Public festival crowd footage. The masters have not been reviewed frame by frame for identifiable children; confirm before publishing.",
    driveIds: ["1XfDRt8zCKZt4I7NMVPQvD5zEbZ79wE8F", "1-cXGFWuayAbivwuRjrLj-SIQWencN6Bd"],
    files: ["copy_1F5FEEA9-E1D2-428A-8131-04EB870241A8.MOV", "copy_AF4A8929-C85A-4528-B919-3EEBA831958B.MOV"],
  },
];
