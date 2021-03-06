import React, { useEffect, useState, MouseEvent } from "react";
import { useParams } from "react-router-dom";
import "./App.css";
import { Skill, getSkills, DiaryEntry, getDiaryEntrySkills, DiaryEntrySkills, retreiveDiaryEntry, updateDiaryEntry } from "./FetchAPI";
import { SkillsGroup } from "./components/DisplaySkill";
import UIButton from "./components/Button";
import { Accordion, AccordionTitleProps } from "semantic-ui-react";

type CheckedSkills = {
  [key: number]: boolean;
};

type CategorizedSkills = {
  [key: string]: Skill[];
};

function Diary () {
  let { entryDate } = useParams<string>();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [diaryEntryId, setDiaryEntryId] = useState<number>(0);
  const [checked, setChecked] = useState<CheckedSkills>({});
  const [activeIndex, setActiveIndex] = useState<number>(0);

  let date = entryDate!;

  useEffect(() => {
  retreiveDiaryEntry(date).then((value) => {
    setDiaryEntryId(value.id);
  })
  }, []);

  useEffect(() => {
    getDiaryEntrySkills(date).then(initChecked)
  }, []);

  useEffect(() => {
    getSkills("/skills").then(setSkills);
  }, []);


  let categorized_skills = skills.reduce(
    (init: CategorizedSkills, skill: Skill) => {
      if (!init[skill.category]) {
        init[skill.category] = [];
      }
      init[skill.category].push(skill);
      return init;
    },
    {}
  );

  let initChecked = (diaryEntrySkills: DiaryEntrySkills[]) => {
    let skillIDs = diaryEntrySkills.map(item => item['skills_id']);
    let checked = skillIDs.reduce(
      (init: CheckedSkills, skillID) => (
        {...init,[skillID]:true}),
      {}
    );
    setChecked(checked);
  };

  let updateChecked = (id: number) => {
    setChecked({ ...checked, [id]: !checked[id] });
  };

  let checkSkills = Object.entries(checked).reduce(
    (init: number[], [key, value]) => {
      if (value === true) {
        init.push(parseInt(key));
      }
      return init;
    },
    []
  );

  let toggleAccordion = (
    event: MouseEvent<HTMLDivElement>,
    data: AccordionTitleProps
  ) => {
    const { index } = data;
    if (typeof index === "undefined") {
      return setActiveIndex(-1);
    } else if (typeof index === "string") {
      return setActiveIndex(-1);
    }

    const newIndex: number = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  const diaryentry: DiaryEntry = {
    entry_date: new Date(date),
    skill_ids: checkSkills,
  };

  const entry_id = diaryEntryId;

  let submitForm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
   updateDiaryEntry(entry_id, diaryentry);
  };

  return (
    <div className="App">
      <Accordion>
        <SkillsGroup
          category={"mindfulness"}
          categorized_skills={categorized_skills}
          category_index={0}
          update_checked={updateChecked}
          checkedSkills={checked}
          active_index={activeIndex}
          handle_click={toggleAccordion}
        />
        <SkillsGroup
          category={"emotion_regulation"}
          categorized_skills={categorized_skills}
          category_index={1}
          update_checked={updateChecked}
          checkedSkills={checked}
          active_index={activeIndex}
          handle_click={toggleAccordion}
        />
        <SkillsGroup
          category={"distress_tolerance"}
          categorized_skills={categorized_skills}
          category_index={2}
          update_checked={updateChecked}
          checkedSkills={checked}
          active_index={activeIndex}
          handle_click={toggleAccordion}
        />
      </Accordion>
      <UIButton text="Submit" onClick={submitForm} />
    </div>
  );
}

export default Diary;
