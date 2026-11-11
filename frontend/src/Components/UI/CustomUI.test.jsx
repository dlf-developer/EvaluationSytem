import React, { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Collapse,
  Statistic,
  Descriptions,
  Empty,
  Drawer,
  Switch,
} from "./index";

jest.mock("lucide-react", () => {
  const React = require("react");
  return new Proxy(
    {},
    {
      get: (_target, prop) => (props) =>
        React.createElement("span", { "data-icon": String(prop), ...props }),
    }
  );
});

describe("Custom UI AntD Compatibility Fixes", () => {
  test("Modal.confirm renders dialog, awaits async onOk, and unmounts", async () => {
    let resolved = false;
    const onOk = jest.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolved = true;
            resolve();
          }, 20);
        })
    );

    act(() => {
      Modal.confirm({
        title: "Delete Record?",
        content: "This action cannot be undone.",
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk,
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Delete Record?")).toBeInTheDocument();
    });
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Yes, Delete"));
    expect(onOk).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(resolved).toBe(true);
      expect(screen.queryByText("Delete Record?")).not.toBeInTheDocument();
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 170));
    });
  });

  test("Modal.warning renders single OK button with okButtonProps style", async () => {
    act(() => {
      Modal.warning({
        title: "Account Inactive",
        content: "Connect with Admin",
        okText: "I Understand",
        okButtonProps: {
          style: { backgroundColor: "#4A6741" },
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Account Inactive")).toBeInTheDocument();
    });
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    const okBtn = screen.getByText("I Understand").closest("button");
    expect(okBtn.style.backgroundColor).toBe("rgb(74, 103, 65)");

    fireEvent.click(okBtn);
    await waitFor(() => {
      expect(screen.queryByText("Account Inactive")).not.toBeInTheDocument();
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 170));
    });
  });

  test("Form.Item shouldUpdate + function children updates on nested path changes without looping", async () => {
    let formRef;
    let renderCount = 0;

    const TestComp = () => {
      const [form] = Form.useForm();
      formRef = form;
      return (
        <Form
          form={form}
          initialValues={{
            teacherScores: [{ daSec1High: 6, daSec1Low: 8 }],
          }}
        >
          <Form.Item
            shouldUpdate={(prev, cur) =>
              prev.teacherScores?.[0] !== cur.teacherScores?.[0]
            }
            noStyle
          >
            {({ getFieldValue }) => {
              renderCount += 1;
              const s = getFieldValue(["teacherScores", 0]) || {};
              const avg = (((s.daSec1High || 0) + (s.daSec1Low || 0)) / 2).toFixed(2);
              setTimeout(() => {
                form.setFieldValue(["teacherScores", 0, "daAverage"], parseFloat(avg));
              }, 0);
              return <div data-testid="calc-box">Avg: {avg}</div>;
            }}
          </Form.Item>
        </Form>
      );
    };

    render(<TestComp />);
    expect(screen.getByTestId("calc-box")).toHaveTextContent("Avg: 7.00");

    // Let initial derived-value timer settle cleanly inside act
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(formRef.getFieldValue(["teacherScores", 0, "daAverage"])).toBe(7);

    act(() => {
      formRef.setFieldValue(["teacherScores", 0, "daSec1Low"], 10);
    });

    await waitFor(() => {
      expect(screen.getByTestId("calc-box")).toHaveTextContent("Avg: 8.00");
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(formRef.getFieldValue(["teacherScores", 0, "daAverage"])).toBe(8);

    // Wait another tick to ensure setTimeout(setFieldValue(daAverage)) didn't cause an infinite loop
    const countAfter = renderCount;
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40));
    });
    expect(renderCount).toBe(countAfter);
  });

  test("Form.Item hidden and hidden noStyle hide content cleanly while preserving values", () => {
    let formRef;
    const TestComp = () => {
      const [form] = Form.useForm();
      formRef = form;
      return (
        <Form form={form}>
          <Form.Item name="secret" initialValue="abc" hidden>
            <Input placeholder="hidden-regular" />
          </Form.Item>
          <Form.Item name="flag" initialValue={true} hidden noStyle>
            <Input placeholder="hidden-nostyle" />
          </Form.Item>
        </Form>
      );
    };

    render(<TestComp />);
    const el1 = screen.getByPlaceholderText("hidden-regular").closest("[aria-hidden='true']");
    const el2 = screen.getByPlaceholderText("hidden-nostyle").closest("[aria-hidden='true']");
    expect(el1).toHaveStyle("display: none");
    expect(el2).toHaveStyle("display: none");
    expect(formRef.getFieldValue("secret")).toBe("abc");
    expect(formRef.getFieldValue("flag")).toBe(true);
  });

  test("FormStore.validateFields provides errorFields, clears resolved errors, and Form.List displays list error", async () => {
    let formRef;
    const TestComp = () => {
      const [form] = Form.useForm();
      const [requiredOn, setRequiredOn] = useState(true);
      formRef = form;
      return (
        <div>
          <button type="button" onClick={() => setRequiredOn(false)}>
            Disable Rule
          </button>
          <Form form={form}>
            <Form.Item
              name="title"
              rules={requiredOn ? [{ required: true, message: "Title is required" }] : []}
            >
              <Input placeholder="Title" />
            </Form.Item>
            <Form.List
              name="sections"
              rules={[
                {
                  validator: async (_, s) =>
                    !s || s.length < 1
                      ? Promise.reject(new Error("At least one section is required"))
                      : undefined,
                },
              ]}
            >
              {(fields, { add }) => (
                <div>
                  {fields.map((f) => (
                    <span key={f.key}>Row {f.name}</span>
                  ))}
                  <button type="button" onClick={() => add("A")}>
                    Add Row
                  </button>
                </div>
              )}
            </Form.List>
          </Form>
        </div>
      );
    };

    render(<TestComp />);

    let caughtErr;
    await act(async () => {
      try {
        await formRef.validateFields();
      } catch (e) {
        caughtErr = e;
      }
    });

    expect(caughtErr).toBeDefined();
    expect(Array.isArray(caughtErr.errorFields)).toBe(true);
    expect(caughtErr.errorFields.length).toBe(2);
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("At least one section is required")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Disable Rule"));
    fireEvent.click(screen.getByText("Add Row"));

    await waitFor(() => {
      expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
      expect(screen.queryByText("At least one section is required")).not.toBeInTheDocument();
    });

    let values;
    await act(async () => {
      values = await formRef.validateFields();
    });
    expect(values.sections).toEqual(["A"]);
  });

  test("Descriptions flattens React.Fragment children cleanly", () => {
    render(
      <Descriptions bordered>
        <Descriptions.Item label="Name">Monish</Descriptions.Item>
        <>
          <Descriptions.Item label="OT Privilege">Enabled</Descriptions.Item>
          <Descriptions.Item label="Comment Access">Allowed</Descriptions.Item>
        </>
      </Descriptions>
    );

    expect(screen.getByText("Name:")).toBeInTheDocument();
    expect(screen.getByText("OT Privilege:")).toBeInTheDocument();
    expect(screen.getByText("Comment Access:")).toBeInTheDocument();
    expect(screen.queryByText(":")).not.toBeInTheDocument();
  });

  test("Collapse supports accordion + forceRender + extra, and Statistic supports precision", async () => {
    let formRef;
    const TestComp = () => {
      const [form] = Form.useForm();
      formRef = form;
      return (
        <div>
          <Statistic title="Avg" value={8.5} precision={2} />
          <Form form={form}>
            <Collapse defaultActiveKey={["0"]} accordion>
              <Collapse.Panel header="Panel 1" key="0" extra={<span>Extra 1</span>}>
                <div>Body 1</div>
              </Collapse.Panel>
              <Collapse.Panel header="Panel 2" key="1" forceRender>
                <Form.Item name="hiddenPanelInput" rules={[{ required: true, message: "Panel 2 Req" }]}>
                  <Input placeholder="Panel 2 Input" />
                </Form.Item>
              </Collapse.Panel>
            </Collapse>
          </Form>
        </div>
      );
    };

    render(<TestComp />);
    expect(screen.getByText("8.50")).toBeInTheDocument();
    expect(screen.getByText("Extra 1")).toBeInTheDocument();
    expect(screen.getByText("Body 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Panel 2 Input")).toBeInTheDocument();

    // Even when collapsed, forceRender panel validation must still fire
    let failed = false;
    await act(async () => {
      try {
        await formRef.validateFields();
      } catch {
        failed = true;
      }
    });
    expect(failed).toBe(true);

    // Clicking Panel 2 opens it and accordion closes Panel 1
    fireEvent.click(screen.getByText("Panel 2"));
    expect(screen.queryByText("Body 1")).not.toBeInTheDocument();
  });

  test("InputNumber emits numbers, Checkbox emits target.checked, and Select mode=multiple omits empty string", () => {
    let formRef;
    const onCheck = jest.fn();

    const TestComp = () => {
      const [form] = Form.useForm();
      formRef = form;
      return (
        <div>
          <Form form={form}>
            <Form.Item name="score">
              <InputNumber placeholder="Score" />
            </Form.Item>
            <Form.Item name="teachers">
              <Select
                mode="multiple"
                placeholder="Pick teachers"
                options={[
                  { value: "t1", label: "Teacher 1" },
                  { value: "t2", label: "Teacher 2" },
                ]}
              />
            </Form.Item>
            <Form.Item name="active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
          <Checkbox onChange={(e) => onCheck(e.target.checked)}>Select row</Checkbox>
        </div>
      );
    };

    render(<TestComp />);

    const scoreInput = screen.getByPlaceholderText("Score");
    fireEvent.change(scoreInput, { target: { value: "8.5" } });
    expect(typeof formRef.getFieldValue("score")).toBe("number");
    expect(formRef.getFieldValue("score")).toBe(8.5);

    fireEvent.click(screen.getByText("Pick teachers"));
    fireEvent.click(screen.getByText("Teacher 1"));
    expect(formRef.getFieldValue("teachers")).toEqual(["t1"]);

    fireEvent.click(screen.getByText("Select row"));
    expect(onCheck).toHaveBeenCalledWith(true);
  });

  test("Empty.PRESENTED_IMAGE_SIMPLE and Drawer placement render cleanly", () => {
    const { container } = render(
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Simple Empty" />
        <Drawer open={true} placement="right" onClose={() => {}}>
          <span>Right Drawer</span>
        </Drawer>
      </div>
    );

    expect(Empty.PRESENTED_IMAGE_SIMPLE).toBeDefined();
    expect(screen.getByText("Simple Empty")).toBeInTheDocument();
    expect(screen.getByText("Right Drawer")).toBeInTheDocument();
    expect(container.querySelector(".right-0")).toBeTruthy();
  });
});
