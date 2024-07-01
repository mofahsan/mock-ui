import axios from "axios";
import { Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { env } from "../env/env";
import {
  FormFieldWrapper,
  LabelContainer,
  InfoIconWrapper,
} from "../styled/renderInput.style";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useEffect, useRef } from "react";
import { useState } from "react";

const exeptions = ["startStop", "endStop"];
const RenderInput = ({
  data,
  control,
  errors,
  watch,
  setValue,
  storeDefaultValue,
}) => {
  const [selectOptions, setSelectOptions] = useState();
  const [url, setUrl] = useState("");
  const [formData, setFormData] = useState(watch());
  const [selectDefaultValue, setSelectDefaultValue] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [isSubmissionIdFetched, setIsSubmissionIdFetched] = useState(false);
  const isSetValueRefresh = useRef(false);

  // there is only one form in the ui
  useEffect(() => {
    getOptions();
  }, [data, formData]);

  useEffect(() => {
    const subscription = watch((value) => {
      setFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, data]);

  const isJSON = (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      return false;
    }
  };

  const getOptions = async () => {
    // if (isSetValueRefresh.current) {
    //   isSetValueRefresh.current = false;
    //   return;
    // }

    if (data.type !== "select" && data.type !== "form") {
      return;
    }

    if (data.config !== data.currentConfig) {
      return;
    }

    try {
      let path = data.extractionPath;

      path = eval(path);

      if (!path) return;

      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const res = await axios.post(
        `${env.sandBox}/mapper/extractPath`,
        JSON.stringify({
          path: path,
          obj: { businessPayload: data.businessPayload },
        }),
        header
      );

      const filteredOptions = res.data.response?.data?.filter(
        (obj, index, self) => index === self.findIndex((t) => t.key === obj.key)
      );

      setIsFetched(true);
      if (data.type === "select") {
        if (filteredOptions.length === 1) {
          setSelectDefaultValue(filteredOptions[0].key);
          storeDefaultValue(data.key, filteredOptions[0].key);
          // setValue(data.key, filteredOptions[0].key);
          // default value for select
        }
        setSelectOptions(filteredOptions);
      } else if (data.type === "form") {
        setUrl(filteredOptions?.[0]?.value);
        // need to do something about this
        // setValue(data.key, filteredOptions?.[0]?.value);
      }
    } catch (e) {
      console.log("Error while fetching option", e);
      toast.error(JSON.stringify(e?.response?.data));
    }
  };

  if (data.type === "text") {
    return (
      <FormFieldWrapper>
        <LabelContainer isRequired={data.required}>
          <label htmlFor={data.key}>{data.name}</label>
          <Tooltip title={data.summary}>
            <InfoOutlinedIcon
              style={{
                height: "20px",
                width: "20px",
                color: "rgb(152 152 152)",
              }}
            />
          </Tooltip>
        </LabelContainer>
        <Controller
          name={data.key}
          control={control}
          defaultValue={data?.defaultValue || ""}
          rules={{ required: data.errorText }}
          render={({ field }) => (
            <>
              <input {...field} />
              {errors?.[data?.key] && <p>{errors?.[data?.key]?.message}</p>}
            </>
          )}
        />
      </FormFieldWrapper>
    );
  } else if (data.type === "select") {
    return (
      <FormFieldWrapper>
        <LabelContainer isRequired={data.required}>
          <label htmlFor={data.key}>{data.name}</label>
          <Tooltip title={data.summary}>
            <InfoOutlinedIcon
              style={{
                height: "20px",
                width: "20px",
                color: "rgb(152 152 152)",
              }}
            />
          </Tooltip>
        </LabelContainer>
        <Controller
          name={data.key}
          control={control}
          defaultValue={
            eval(data?.defaultValueExpression) || data?.defaultValue
          }
          rules={{ required: data.required && data.errorText }}
          render={({ field }) => (
            <>
              <select
                {...field}
                onChange={(e) => {
                  const a = e.target.options[e.target.selectedIndex];
                  const properties = JSON.parse(a.dataset.properties);
                  delete properties.key;
                  delete properties.value;

                  Object.entries(properties)?.map((item) => {
                    const [key, value] = item;
                    setValue(key, value);
                  });

                  field.onChange(e);
                }}
              >
                <option disabled="disabled">select value</option>
                {(
                  selectOptions ||
                  data?.providedOptions ||
                  data?.defaultOptions
                )?.map((item, index) => {
                  return (
                    <option
                      selected={index === 0}
                      data-properties={JSON.stringify(item)}
                      value={item.value}
                    >
                      {item.key}
                    </option>
                  );
                })}
              </select>
              {errors[data.key] && <p>{errors[data.key].message}</p>}
            </>
          )}
        />
      </FormFieldWrapper>
    );
  } else if (data.type === "multiline") {
    return (
      <FormFieldWrapper>
        <LabelContainer isRequired={data.required}>
          <label htmlFor={data.key}>{data.name}</label>
          <Tooltip title={data.summary}>
            <InfoOutlinedIcon
              style={{
                height: "20px",
                width: "20px",
                color: "rgb(152 152 152)",
              }}
            />
          </Tooltip>
        </LabelContainer>
        <Controller
          name={data.key}
          control={control}
          defaultValue={JSON.stringify(data?.defaultValue, null, 2) || ""}
          rules={{
            required: data.errorText,
            validate: {
              isJSON: (value) => isJSON(value) || "Invalid JSON format",
            },
          }}
          render={({ field }) => (
            <>
              <textarea {...field} rows={3} />
              {errors?.[data.key] && <p>{errors?.[data.key].message}</p>}
            </>
          )}
        />
      </FormFieldWrapper>
    );
  } else if (data.type === "form") {
    return (
      <>
        <LabelContainer isRequired={data.required}>
          <label>{data.name}</label>
          <Tooltip title={data.summary}>
            <InfoOutlinedIcon
              style={{
                height: "20px",
                width: "20px",
                color: "rgb(152 152 152)",
              }}
            />
          </Tooltip>
        </LabelContainer>
        {url ? (
          <a href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
        ) : (
          <div> Select bpp_id and bpp_uri to view the url</div>
        )}
      </>
    );
  }
};

export default RenderInput;
